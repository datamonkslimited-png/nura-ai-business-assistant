from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "nura_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Africa/Nairobi",
    enable_utc=True,
    beat_schedule={
        "send-booking-reminders": {
            "task": "app.workers.tasks.send_booking_reminders",
            "schedule": 3600.0,  # every hour
        },
        "reconcile-payments": {
            "task": "app.workers.tasks.reconcile_pending_payments",
            "schedule": 300.0,   # every 5 minutes
        },
        "check-unconfirmed-orders": {
            "task": "app.workers.tasks.check_unconfirmed_orders",
            "schedule": 900.0,   # every 15 minutes
        },
    },
)
