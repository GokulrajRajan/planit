from datetime import datetime, timedelta, timezone

from app.services.announcement_service import create_announcement
from app.services.enquiry_service import create_enquiry, set_enquiry_handled
from app.services.newsletter_service import subscribe
from app.services.post_service import create_post


def test_admin_sees_website_counts(client, admin, admin_headers):
    create_post(admin, {"title": "What is a SIP?", "content": "...", "status": "published"})
    create_post(admin, {"title": "Draft thoughts", "content": "..."})
    create_post(admin, {"title": "October update", "content": "...", "status": "published", "post_type": "market_update"})
    handled = create_enquiry({"name": "Ravi", "phone": "9876543210", "email": "ravi@example.com"})
    create_enquiry({"name": "Meena", "phone": "9876543211", "email": "meena@example.com"})
    set_enquiry_handled(handled, True)
    subscribe("reader@example.com")
    create_announcement({"text": "Office closed on Diwali"})
    create_announcement({"text": "Expired", "ends_at": datetime.now(timezone.utc) - timedelta(days=1)})

    stats = client.get("/api/dashboard/stats", headers=admin_headers).get_json()["data"]["stats"]

    assert stats == {
        "total_posts": 3,
        "published_posts": 2,
        "draft_posts": 1,
        "published_blog_posts": 1,
        "published_market_updates": 1,
        "total_users": 1,
        "new_enquiries": 1,
        "total_enquiries": 2,
        "newsletter_subscribers": 1,
        "active_announcements": 1,
    }


def test_dashboard_needs_an_editor(client, reader_headers):
    assert client.get("/api/dashboard/stats").status_code == 401
    assert client.get("/api/dashboard/stats", headers=reader_headers).status_code == 403
