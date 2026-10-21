from app.extensions import db
from app.models.team import TeamMember
from app.utils.errors import APIError

TEAM_MEMBER_FIELDS = (
    "name",
    "designation",
    "qualifications",
    "bio",
    "photo_url",
    "linkedin_url",
    "sort_order",
    "visible",
)


def _ordered_query():
    return TeamMember.query.order_by(TeamMember.sort_order.asc(), TeamMember.id.asc())


def list_visible_team_members() -> list[TeamMember]:
    return _ordered_query().filter(TeamMember.visible.is_(True)).all()


def list_all_team_members() -> list[TeamMember]:
    return _ordered_query().all()


def get_team_member_or_404(member_id: int) -> TeamMember:
    member = db.session.get(TeamMember, member_id)
    if member is None:
        raise APIError("Team member not found", status=404)
    return member


def create_team_member(data: dict) -> TeamMember:
    member = TeamMember(**{field: data[field] for field in TEAM_MEMBER_FIELDS if field in data})
    db.session.add(member)
    db.session.commit()
    return member


def update_team_member(member: TeamMember, data: dict) -> TeamMember:
    for field in TEAM_MEMBER_FIELDS:
        if field in data:
            setattr(member, field, data[field])
    db.session.commit()
    return member


def delete_team_member(member: TeamMember) -> None:
    db.session.delete(member)
    db.session.commit()
