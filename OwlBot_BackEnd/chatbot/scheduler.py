from apscheduler.schedulers.background import BackgroundScheduler #type:ignore
from apscheduler.triggers.date import DateTrigger #type:ignore
from apscheduler.triggers.cron import CronTrigger #type:ignore
from django_apscheduler.jobstores import DjangoJobStore #type:ignore
from .startup_tasks import main as startup_tasks
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Initialize the scheduler
scheduler = BackgroundScheduler()
scheduler.add_jobstore(DjangoJobStore(), "default")

def add_one_time_task(run_date):
    """Add a one-time task to the scheduler."""
    try:
        scheduler.add_job(
            startup_tasks,
            trigger=DateTrigger(run_date=run_date),
            id="one_time_task",
            replace_existing=True,
        )
        logger.info(f"One-time task scheduled for {run_date}")
    except Exception as e:
        logger.error(f"Error scheduling one-time task: {e}")

def add_recurring_task(cron_expression):
    """Add a recurring task to the scheduler."""
    try:
        scheduler.add_job(
            startup_tasks,
            trigger=CronTrigger(**cron_expression),
            id="recurring_task",
            replace_existing=True,
        )
        logger.info(f"Recurring task scheduled with cron: {cron_expression}")
    except Exception as e:
        logger.error(f"Error scheduling recurring task: {e}")

def remove_task(job_id):
    """Remove a task by job ID."""
    try:
        scheduler.remove_job(job_id)
        logger.info(f"Task {job_id} removed")
    except Exception as e:
        logger.error(f"Error removing task {job_id}: {e}")

def start_scheduler():
    """Start the scheduler."""
    try:
        scheduler.start()
        logger.info("Scheduler started")
    except Exception as e:
        logger.error(f"Error starting scheduler: {e}")
