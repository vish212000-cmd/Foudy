from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = 'core'

    def ready(self):
        import sys
        if 'runserver' in sys.argv or 'daphne' in sys.argv or 'gunicorn' in sys.argv:
            from core.startup import boot_diagnostics
            boot_diagnostics()
