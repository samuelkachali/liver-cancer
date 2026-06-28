import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings


async def send_verification_email(to_email: str, full_name: str) -> None:
    """Send verification email to user when their account is approved."""
    if not settings.smtp_user or not settings.smtp_password:
        print(f"Email not configured. Would send verification email to {to_email}")
        return

    subject = "Your MediVision AI Account Has Been Verified"
    body = f"""
Dear {full_name},

Your account has been verified and you can now log in to MediVision AI.

Login URL: http://localhost:3000/login

If you have any questions, please contact your administrator.

Best regards,
MediVision AI Team
"""

    msg = MIMEMultipart()
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        print(f"Verification email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")


async def send_rejection_email(to_email: str, full_name: str) -> None:
    """Send rejection email to user when their account is rejected."""
    if not settings.smtp_user or not settings.smtp_password:
        print(f"Email not configured. Would send rejection email to {to_email}")
        return

    subject = "Your MediVision AI Account Registration"
    body = f"""
Dear {full_name},

We regret to inform you that your account registration has been rejected by the administrator.

If you believe this is an error, please contact your administrator.

Best regards,
MediVision AI Team
"""

    msg = MIMEMultipart()
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        print(f"Rejection email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
