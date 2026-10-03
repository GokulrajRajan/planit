from app.extensions import db


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    slug = db.Column(db.String(120), nullable=False, unique=True, index=True)

    posts = db.relationship("Post", back_populates="category", lazy="dynamic")

    def __repr__(self) -> str:
        return f"<Category {self.name}>"
