# Stub: later integrate email/SMS push. For now, just log.
from app.utils.logging import logger

def notify_patient(email: str, message: str):
    logger.info(f"Notify {email}: {message}")
