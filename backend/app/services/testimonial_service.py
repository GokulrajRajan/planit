from app.extensions import db
from app.models.testimonial import Testimonial
from app.utils.errors import APIError

TESTIMONIAL_FIELDS = ("author_name", "author_detail", "content", "sort_order", "visible")


def _ordered_query():
    return Testimonial.query.order_by(Testimonial.sort_order.asc(), Testimonial.id.asc())


def list_visible_testimonials() -> list[Testimonial]:
    return _ordered_query().filter(Testimonial.visible.is_(True)).all()


def list_all_testimonials() -> list[Testimonial]:
    return _ordered_query().all()


def get_testimonial_or_404(testimonial_id: int) -> Testimonial:
    testimonial = db.session.get(Testimonial, testimonial_id)
    if testimonial is None:
        raise APIError("Testimonial not found", status=404)
    return testimonial


def create_testimonial(data: dict) -> Testimonial:
    testimonial = Testimonial(**{field: data[field] for field in TESTIMONIAL_FIELDS if field in data})
    db.session.add(testimonial)
    db.session.commit()
    return testimonial


def update_testimonial(testimonial: Testimonial, data: dict) -> Testimonial:
    for field in TESTIMONIAL_FIELDS:
        if field in data:
            setattr(testimonial, field, data[field])
    db.session.commit()
    return testimonial


def delete_testimonial(testimonial: Testimonial) -> None:
    db.session.delete(testimonial)
    db.session.commit()
