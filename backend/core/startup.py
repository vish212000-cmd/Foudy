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
        print("[PASS] Environment & Keys")
    except Exception as e:
        print("[FAIL] Environment & Keys")
        critical_failures.append(f"Missing required env: {e}")

    # 2. Database Connection (CRITICAL)
    try:
        connection.ensure_connection()
        print("[PASS] Database (PostgreSQL)")
    except Exception as e:
        print("[FAIL] Database (PostgreSQL)")
        critical_failures.append(f"Database error: {e}")

    # 3. Redis Connection (NON-CRITICAL / DEGRADED)
    try:
        from core.redis_client import get_redis_client
        r = get_redis_client()
        if r is None:
            raise Exception("Invalid or missing REDIS_URL")
        r.ping()
        print("[PASS] Redis (Upstash/Cache)")
    except Exception as e:
        print("[WARN] Redis (Degraded)")
        degraded_services.append(f"Redis is unavailable: {e}")

    # 4. Celery Broker (CRITICAL)
    if getattr(settings, 'CELERY_BROKER_URL', None):
        print("[PASS] Celery Broker")
    else:
        print("[FAIL] Celery Broker")
        critical_failures.append("CELERY_BROKER_URL is missing")

    # 5. Cloudinary (NON-CRITICAL / DEGRADED)
    if getattr(settings, 'CLOUDINARY_STORAGE', {}).get('CLOUDINARY_URL'):
        print("[PASS] Cloudinary Storage")
    else:
        print("[WARN] Cloudinary Storage (Degraded)")
        degraded_services.append("CLOUDINARY_URL is missing")

    # 6. Resend Email (NON-CRITICAL / DEGRADED)
    if getattr(settings, 'ANYMAIL', {}).get('RESEND_API_KEY'):
        print("[PASS] Resend Email API")
    else:
        print("[WARN] Resend Email API (Degraded)")
        degraded_services.append("RESEND_API_KEY is missing")

    # 7. TURN Server (NON-CRITICAL / DEGRADED)
    if env('TURN_SECRET', default=None) and env('TURN_URL', default=None):
        print("[PASS] TURN Server")
    else:
        print("[WARN] TURN Server (Degraded)")
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
