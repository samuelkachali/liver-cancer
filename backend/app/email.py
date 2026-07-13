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

async def send_verification_email(to_email: str, full_name: str) -> bool:
    return await send_email(
        to_email=to_email,
        subject="Your MediVision AI account has been verified",
        body=(
            f"Hi {full_name},\n\n"
            f"Your MediVision AI account has been verified by an admin. "
            f"You can now sign in and use the platform.\n\n"
            f"If you did not request this account, you can safely ignore this email."
        ),
    )


async def send_rejection_email(to_email: str, full_name: str) -> bool:
    return await send_email(
        to_email=to_email,
        subject="Your MediVision AI account was not approved",
        body=(
            f"Hi {full_name},\n\n"
            f"Unfortunately, your MediVision AI account registration was rejected by an admin. "
            f"If you believe this was a mistake, please contact support.\n\n"
        ),
    )
