from apscheduler.schedulers.background import BackgroundScheduler  # type:ignore
from apscheduler.triggers.date import DateTrigger  # type:ignore
from apscheduler.triggers.cron import CronTrigger  # type:ignore
from django_apscheduler.jobstores import DjangoJobStore  # type:ignore
from .startup_tasks import main as startup_tasks
import logging
from datetime import datetime

# Set up logging
logger = logging.getLogger(__name__)

# Initialize the scheduler
scheduler = BackgroundScheduler()
scheduler.add_jobstore(DjangoJobStore(), "default")


def add_one_time_task(run_date):
    """Add a one-time task to the scheduler."""
    try:
        # Validate and parse the run_date
        if not run_date:
            raise ValueError("Run date is required for one-time tasks.")

        run_date_obj = datetime.fromisoformat(run_date)  # Validate ISO 8601 format
        job_id = f"one_time_task_{run_date_obj.isoformat()}"
        scheduler.add_job(
            startup_tasks,
            trigger=DateTrigger(run_date=run_date_obj),
            id=job_id,
            replace_existing=True,
        )
        logger.info(
            f"One-time task successfully scheduled for {run_date_obj} with ID {job_id}."
        )
    except ValueError as ve:
        logger.error(f"Invalid run_date format: {run_date}. Error: {ve}")
        raise
    except Exception as e:
        logger.error(f"Error scheduling one-time task: {e}")
        raise


def add_recurring_task(cron_expression):
    """Add a recurring task to the scheduler."""
    try:
        # Validate the cron expression
        if not isinstance(cron_expression, dict):
            raise ValueError("Cron expression must be a valid dictionary.")

        cron_str = "_".join(f"{key}-{value}" for key, value in cron_expression.items())
        job_id = f"recurring_task_{cron_str}"

        scheduler.add_job(
            startup_tasks,
            trigger=CronTrigger(**cron_expression),
            id=job_id,
            replace_existing=True,
        )
        logger.info(
            f"Recurring task successfully scheduled with cron: {cron_expression} with ID {job_id}."
        )
    except TypeError as te:
        logger.error(f"Invalid cron expression fields: {cron_expression}. Error: {te}")
        raise
    except Exception as e:
        logger.error(f"Error scheduling recurring task: {e}")
        raise


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

def list_jobs():
    jobs = scheduler.get_jobs()
    for job in jobs:
        print(f"Job ID: {job.id}, Next Run: {job.next_run_time}, Trigger: {job.trigger}")

list_jobs()