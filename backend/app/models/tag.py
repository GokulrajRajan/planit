from app.extensions import db


class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), nullable=False, unique=True)
    slug = db.Column(db.String(80), nullable=False, unique=True, index=True)

    def __repr__(self) -> str:
        return f"<Tag {self.name}>"
