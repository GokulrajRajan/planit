import smtplib
from email.message import EmailMessage

from flask import current_app


def send_email(subject: str, body: str, to: list[str], reply_to: str | None = None) -> bool:
    """Sends a plain-text email. Returns False, without raising, when mail isn't configured or fails."""
    config = current_app.config
    if not config["MAIL_SERVER"] or not to:
        current_app.logger.info("Email not sent (MAIL_SERVER or recipients not configured): %s", subject)
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = config["MAIL_FROM"] or config["MAIL_USERNAME"]
    message["To"] = ", ".join(to)
    if reply_to:
        message["Reply-To"] = reply_to
    message.set_content(body)

    smtp_class = smtplib.SMTP_SSL if config["MAIL_USE_SSL"] else smtplib.SMTP
    try:
        with smtp_class(config["MAIL_SERVER"], config["MAIL_PORT"], timeout=10) as smtp:
            if config["MAIL_USE_TLS"] and not config["MAIL_USE_SSL"]:
                smtp.starttls()
            if config["MAIL_USERNAME"]:
                smtp.login(config["MAIL_USERNAME"], config["MAIL_PASSWORD"])
            smtp.send_message(message)
    except (smtplib.SMTPException, OSError):
        current_app.logger.exception("Failed to send email: %s", subject)
        return False
    return True
