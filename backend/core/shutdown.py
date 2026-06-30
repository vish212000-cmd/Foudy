import signal
import sys
import logging
from django.db import connection

logger = logging.getLogger('foudy.shutdown')

def handle_shutdown(signum, frame):
    logger.info(f"Received termination signal: {signum}. Initiating graceful shutdown...")
    try:
        connection.close()
        logger.info("Closed database connections successfully.")
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")
    
    # In a full ASGI setup, Daphne handles WebSocket drain.
    # Celery workers receive their own SIGTERM and handle Warm Shutdown automatically.
    
    logger.info("Graceful shutdown complete.")
    sys.exit(0)

def register_shutdown_handlers():
    """Register signal handlers for graceful shutdown."""
    try:
        signal.signal(signal.SIGINT, handle_shutdown)
        signal.signal(signal.SIGTERM, handle_shutdown)
    except Exception as e:
        logger.warning(f"Could not register signal handlers: {e}")
