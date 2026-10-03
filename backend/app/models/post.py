from datetime import datetime, timezone

from app.extensions import db

post_tags = db.Table(
    "post_tags",
    db.Column("post_id", db.Integer, db.ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class PostStatus:
    DRAFT = "draft"
    PUBLISHED = "published"
    ALL = (DRAFT, PUBLISHED)


class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(220), nullable=False, unique=True, index=True)
    excerpt = db.Column(db.String(500), nullable=True)
    content = db.Column(db.Text, nullable=False)
    cover_image_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), nullable=False, default=PostStatus.DRAFT, index=True)

    author_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    published_at = db.Column(db.DateTime, nullable=True)

    author = db.relationship("User", back_populates="posts")
    category = db.relationship("Category", back_populates="posts")
    tags = db.relationship("Tag", secondary=post_tags, backref=db.backref("posts", lazy="dynamic"))
    comments = db.relationship(
        "Comment", back_populates="post", lazy="dynamic", cascade="all, delete-orphan"
    )

    @property
    def is_published(self) -> bool:
        return self.status == PostStatus.PUBLISHED

    def __repr__(self) -> str:
        return f"<Post {self.slug}>"
