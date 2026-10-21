from app.models.post import Post, PostStatus
from app.models.user import User


def get_stats(user: User) -> dict:
    post_query = Post.query if user.is_admin else Post.query.filter_by(author_id=user.id)

    total_posts = post_query.count()
    published_posts = post_query.filter(Post.status == PostStatus.PUBLISHED).count()
    draft_posts = post_query.filter(Post.status == PostStatus.DRAFT).count()

    stats = {
        "total_posts": total_posts,
        "published_posts": published_posts,
        "draft_posts": draft_posts,
    }

    if user.is_admin:
        stats["total_users"] = User.query.count()

    return stats
