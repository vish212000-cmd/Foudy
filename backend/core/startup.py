import sys
import logging
import redis
from django.db import connection
from django.conf import settings
import environ

logger = logging.getLogger('foudy.startup')

def boot_diagnostics():
    """
    Run proactive dependency checks.
    Fails fast for critical services, reports degraded for non-critical.
    """
    if 'test' in sys.argv:
        return

    print("==================================================")
    print("           APPLICATION BOOT REPORT")
    print("==================================================")

    critical_failures = []
    degraded_services = []

    # 1. Environment Variables & Secret Keys (CRITICAL)
    env = environ.Env()
    try:
        env('SECRET_KEY')
        env('JWT_SECRET_KEY', default='fallback') # Or check settings.SIMPLE_JWT
        print("[✓] Environment & Keys")
    except Exception as e:
        print("[✗] Environment & Keys")
        critical_failures.append(f"Missing required env: {e}")

    # 2. Database Connection (CRITICAL)
    try:
        connection.ensure_connection()
        print("[✓] Database (PostgreSQL)")
    except Exception as e:
        print("[✗] Database (PostgreSQL)")
        critical_failures.append(f"Database error: {e}")

    # 3. Redis Connection (CRITICAL)
    try:
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        print("[✓] Redis (Upstash/Cache)")
    except Exception as e:
        print("[✗] Redis (Upstash/Cache)")
        critical_failures.append(f"Redis error: {e}")

    # 4. Celery Broker (CRITICAL)
    if getattr(settings, 'CELERY_BROKER_URL', None):
        print("[✓] Celery Broker")
    else:
        print("[✗] Celery Broker")
        critical_failures.append("CELERY_BROKER_URL is missing")

    # 5. Cloudinary (NON-CRITICAL / DEGRADED)
    if getattr(settings, 'CLOUDINARY_STORAGE', {}).get('CLOUDINARY_URL'):
        print("[✓] Cloudinary Storage")
    else:
        print("[!] Cloudinary Storage (Degraded)")
        degraded_services.append("CLOUDINARY_URL is missing")

    # 6. Resend Email (NON-CRITICAL / DEGRADED)
    if getattr(settings, 'ANYMAIL', {}).get('RESEND_API_KEY'):
        print("[✓] Resend Email API")
    else:
        print("[!] Resend Email API (Degraded)")
        degraded_services.append("RESEND_API_KEY is missing")

    # 7. TURN Server (NON-CRITICAL / DEGRADED)
    if env('TURN_SECRET', default=None) and env('TURN_URL', default=None):
        print("[✓] TURN Server")
    else:
        print("[!] TURN Server (Degraded)")
        degraded_services.append("TURN_SECRET or TURN_URL is missing")

    print("==================================================")

    if degraded_services:
        print("\nDEGRADED SERVICES (Running with limited functionality):")
        for d in degraded_services:
            print(f" - {d}")
            logger.warning(f"Degraded Service: {d}")

    if critical_failures:
        print("\nCRITICAL STARTUP FAILURE:")
        for f in critical_failures:
            print(f" - {f}")
        logger.critical("Application Boot Report failed. Exiting.")
        sys.exit(1)
    
    logger.info("Application Boot Report passed successfully.")
