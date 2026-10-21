import csv
import io
import re
from datetime import datetime, timezone

from flask import Response

_FORMULA_PREFIXES = ("=", "+", "-", "@", "\t", "\r")
_PLAIN_NUMBER = re.compile(r"^[+\-]?[\d\s()+\-]*$")


def _safe_cell(value) -> str:
    if value is None:
        return ""
    text = value.isoformat() if isinstance(value, datetime) else str(value)
    # Visitors write these values, so stop spreadsheet apps from running them as formulas
    # (CSV injection). Plain numbers such as "+91 98765 43210" can't carry a formula.
    if text.startswith(_FORMULA_PREFIXES) and not _PLAIN_NUMBER.match(text):
        return f"'{text}"
    return text


def csv_response(filename_prefix: str, header: list[str], rows) -> Response:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(header)
    for row in rows:
        writer.writerow([_safe_cell(value) for value in row])

    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    # The byte-order mark makes Excel open the file as UTF-8.
    return Response(
        "﻿" + buffer.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename_prefix}-{stamp}.csv"'},
    )
