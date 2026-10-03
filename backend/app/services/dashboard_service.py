from app.extensions import db
from app.models.comment import Comment
from app.models.post import Post, PostStatus
from app.models.user import User


def get_stats(user: User) -> dict:
    post_query = Post.query if user.is_admin else Post.query.filter_by(author_id=user.id)

    total_posts = post_query.count()
    published_posts = post_query.filter(Post.status == PostStatus.PUBLISHED).count()
    draft_posts = post_query.filter(Post.status == PostStatus.DRAFT).count()

    comment_query = Comment.query
    if not user.is_admin:
        comment_query = comment_query.join(Post).filter(Post.author_id == user.id)
    total_comments = comment_query.count()

    stats = {
        "total_posts": total_posts,
        "published_posts": published_posts,
        "draft_posts": draft_posts,
        "total_comments": total_comments,
    }

    if user.is_admin:
        stats["total_users"] = User.query.count()

    return stats
