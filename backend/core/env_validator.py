import os
from django.core.exceptions import ImproperlyConfigured

REQUIRED_ENV_VARS = [
    'SECRET_KEY',
    'DATABASE_URL',
    'REDIS_URL',
]

def validate_environment():
    """
    Validates that all strictly required environment variables are present.
    Fails fast with a human-readable error to prevent production startup failures.
    """
    missing_vars = []
    for var in REQUIRED_ENV_VARS:
        if not os.environ.get(var):
            missing_vars.append(var)
            
    if missing_vars:
        raise ImproperlyConfigured(
            f"CRITICAL STARTUP FAILURE: The following required environment variables are missing: {', '.join(missing_vars)}. "
            "Please check your Render environment configuration or local .env file."
        )

    # Basic format validation
    db_url = os.environ.get('DATABASE_URL', '')
    if db_url and not (db_url.startswith('postgres://') or db_url.startswith('postgresql://')):
        raise ImproperlyConfigured("DATABASE_URL must be a valid PostgreSQL connection string (starting with postgres:// or postgresql://).")
        
    redis_url = os.environ.get('REDIS_URL', '')
    if redis_url and not (redis_url.startswith('redis://') or redis_url.startswith('rediss://')):
        raise ImproperlyConfigured("REDIS_URL must be a valid Redis connection string (starting with redis:// or rediss://).")
