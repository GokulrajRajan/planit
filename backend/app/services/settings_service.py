from app.extensions import db
from app.models.announcement import AnnouncementPlacement
from app.models.post import Post, PostStatus, PostType
from app.models.site_settings import SiteSettings
from app.models.team import TeamMember
from app.models.testimonial import Testimonial
from app.schemas.settings_schema import SECTION_KEYS, SETTINGS_GROUPS, site_settings_schema
from app.services.announcement_service import active_announcements_query

SETTINGS_ROW_ID = 1


def _defaults() -> dict:
    defaults = {group: dict.fromkeys(schema().fields) for group, schema in SETTINGS_GROUPS.items()}
    defaults.update(portal_url=None, stats=[], sections=dict.fromkeys(SECTION_KEYS, True))
    return defaults


def _with_defaults(stored: dict) -> dict:
    """Fills in every known key, so fields added later show up empty instead of missing."""
    settings = _defaults()
    for key, value in stored.items():
        if key not in settings:
            continue
        if isinstance(settings[key], dict) and isinstance(value, dict):
            settings[key] = {**settings[key], **{k: v for k, v in value.items() if k in settings[key]}}
        else:
            settings[key] = value
    return settings


def _exists(query) -> bool:
    return db.session.query(query.exists()).scalar()


def visible_sections(settings: dict) -> dict[str, bool]:
    """A section shows only when the admin has it switched on and the data it needs exists."""
    officer = settings["grievance_officer"]
    has_data = {
        "announcement_bar": _exists(active_announcements_query(AnnouncementPlacement.BAR)),
        "stats": bool(settings["stats"]),
        "testimonials": _exists(Testimonial.query.filter(Testimonial.visible.is_(True))),
        "team": _exists(TeamMember.query.filter(TeamMember.visible.is_(True))),
        "newsletter": True,
        "faq": True,
        "market_update": _exists(
            Post.query.filter_by(status=PostStatus.PUBLISHED, post_type=PostType.MARKET_UPDATE)
        ),
        "registration_details": bool(settings["registration"]["arn"]),
        "grievance_officer": bool(officer["name"] and (officer["email"] or officer["phone"])),
        "office_map": bool(settings["office"]["map_embed_url"]),
        "social_links": any(settings["social_links"].values()),
        "client_login": bool(settings["portal_url"]),
    }
    return {key: bool(settings["sections"].get(key)) and has_data[key] for key in SECTION_KEYS}


def get_settings() -> dict:
    row = db.session.get(SiteSettings, SETTINGS_ROW_ID)
    settings = _with_defaults(row.data if row else {})
    return {**settings, "visible_sections": visible_sections(settings)}


def update_settings(changes: dict) -> dict:
    """`changes` is loaded (validated) input. Groups and section toggles merge key by key;
    portal_url and stats are replaced whole."""
    row = db.session.get(SiteSettings, SETTINGS_ROW_ID)
    if row is None:
        row = SiteSettings(id=SETTINGS_ROW_ID, data={})
        db.session.add(row)

    stored = _with_defaults(row.data or {})
    # Dumping turns dates back into ISO strings so the JSON column can hold them.
    for key, value in site_settings_schema.dump(changes).items():
        if key in SETTINGS_GROUPS or key == "sections":
            stored[key] = {**stored[key], **value}
        else:
            stored[key] = value

    # A new dict, so SQLAlchemy sees the JSON column as changed.
    row.data = stored
    db.session.commit()
    return get_settings()
