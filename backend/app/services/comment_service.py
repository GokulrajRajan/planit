from app.extensions import db
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.utils.errors import APIError


def list_comments_for_post(post: Post):
    return post.comments.order_by(Comment.created_at.asc()).all()


def create_comment(post: Post, user: User, content: str) -> Comment:
    comment = Comment(content=content, post=post, user=user)
    db.session.add(comment)
    db.session.commit()
    return comment


def get_comment_or_404(comment_id: int) -> Comment:
    comment = db.session.get(Comment, comment_id)
    if comment is None:
        raise APIError("Comment not found", status=404)
    return comment


def can_delete_comment(user: User, comment: Comment) -> bool:
    return user.is_admin or comment.user_id == user.id


def delete_comment(comment: Comment) -> None:
    db.session.delete(comment)
    db.session.commit()
