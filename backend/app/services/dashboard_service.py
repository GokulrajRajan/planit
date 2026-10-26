from app.models.enquiry import Enquiry
from app.models.newsletter import NewsletterSubscriber
from app.models.post import Post, PostStatus, PostType
from app.models.user import User
from app.services.announcement_service import active_announcements_query


def get_stats(user: User) -> dict:
    post_query = Post.query if user.is_admin else Post.query.filter_by(author_id=user.id)
    published = post_query.filter(Post.status == PostStatus.PUBLISHED)

    stats = {
        "total_posts": post_query.count(),
        "published_posts": published.count(),
        "draft_posts": post_query.filter(Post.status == PostStatus.DRAFT).count(),
        "published_blog_posts": published.filter(Post.post_type == PostType.BLOG).count(),
        "published_market_updates": published.filter(Post.post_type == PostType.MARKET_UPDATE).count(),
    }

    if user.is_admin:
        stats.update(
            total_users=User.query.count(),
            new_enquiries=Enquiry.query.filter(Enquiry.handled_at.is_(None)).count(),
            total_enquiries=Enquiry.query.count(),
            newsletter_subscribers=NewsletterSubscriber.query.count(),
            active_announcements=active_announcements_query().count(),
        )

    return stats
