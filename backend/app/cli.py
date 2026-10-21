import click
from marshmallow import ValidationError

from app.schemas.auth_schema import CreateAdminSchema
from app.services.auth_service import create_admin
from app.utils.errors import APIError

create_admin_schema = CreateAdminSchema()


def _format_validation_errors(messages: dict) -> str:
    return "\n".join(
        f"{field}: {' '.join(errors) if isinstance(errors, list) else errors}"
        for field, errors in messages.items()
    )


def register_commands(app):
    @app.cli.command("create-admin")
    @click.option("--name", prompt=True, help="Display name for the admin.")
    @click.option("--email", prompt=True, help="Email address used to log in.")
    @click.password_option(help="At least 8 characters. Asked for (hidden) when omitted.")
    def create_admin_command(name: str, email: str, password: str):
        """Create an admin account. Admins are the only accounts that can log in."""
        try:
            data = create_admin_schema.load({"name": name, "email": email, "password": password})
            user = create_admin(data["name"], data["email"], data["password"])
        except ValidationError as exc:
            raise click.ClickException(_format_validation_errors(exc.messages)) from exc
        except APIError as exc:
            raise click.ClickException(exc.message) from exc

        click.echo(f"Admin created: {user.email} (id {user.id})")
