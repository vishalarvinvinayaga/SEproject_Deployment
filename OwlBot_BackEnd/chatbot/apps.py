from django.apps import AppConfig # type: ignore
import os

class ChatbotConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chatbot'
    def ready(self):
        # Ensure it runs only once, not in every thread
        # if os.environ.get('RUN_MAIN') != 'true':  
        #     from . import startup_tasks  # Import your startup tasks module
        #     startup_tasks.main()  # Call the main function in startup_tasks.py
        # if os.environ.get('RUN MAIN') == 'true':
        #     return True
        from . import startup_tasks
        startup_tasks.main()