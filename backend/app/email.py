import smtplib
from email.message import EmailMessage

from app.config import settings


async def send_email(to_email: str, subject: str, body: str) -> bool:
    if not settings.smtp_user or not settings.smtp_password:
        return False

    message = EmailMessage()
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email or settings.smtp_user}>"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"Failed to send email to {to_email}: {exc}")
        return False
