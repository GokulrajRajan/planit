from datetime import datetime, timezone

from app.extensions import db


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)

    post_id = db.Column(db.Integer, db.ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    post = db.relationship("Post", back_populates="comments")
    user = db.relationship("User", back_populates="comments")

    def __repr__(self) -> str:
        return f"<Comment {self.id} on Post {self.post_id}>"
