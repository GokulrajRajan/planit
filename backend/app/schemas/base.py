from marshmallow import Schema, pre_load

# Required fields reject an empty string (which TrimmedSchema turns into None) with the same message.
REQUIRED = {"required": "This field is required.", "null": "This field is required."}


class TrimmedSchema(Schema):
    """Input schema that trims surrounding whitespace and treats an empty string as "no value"."""

    @pre_load
    def trim_strings(self, data, **kwargs):
        if not isinstance(data, dict):
            return data
        cleaned = {}
        for key, value in data.items():
            if isinstance(value, str):
                value = value.strip() or None
            cleaned[key] = value
        return cleaned
