from flask import current_app, request


def pagination_args() -> tuple[int, int]:
    default_per_page = current_app.config["PER_PAGE_DEFAULT"]
    max_per_page = current_app.config["PER_PAGE_MAX"]
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", default_per_page, type=int), max_per_page)
    return max(page, 1), max(per_page, 1)


def paginated_data(pagination, schema, key: str) -> dict:
    return {
        key: schema.dump(pagination.items),
        "meta": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
        },
    }
