from django.core.cache import cache
from django.http import JsonResponse
import json
import time
import uuid
from .context import correlation_id_var, user_id_var, session_id_var, ip_var, duration_var
from .metrics import MetricsProvider

class RequestLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        req_id = request.headers.get('X-Request-ID', str(uuid.uuid4()))
        corr_id = request.headers.get('X-Correlation-ID', req_id)
        correlation_id_var.set(corr_id)
        
        # Parse Trusted Proxies
        ip = request.META.get('HTTP_X_FORWARDED_FOR')
        if ip:
            # The client IP is the first IP in the comma-separated list
            ip = ip.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        ip_var.set(ip)
        
        response = self.get_response(request)
        
        if hasattr(request, 'user') and request.user.is_authenticated:
            user_id_var.set(str(request.user.id))
            
        duration = time.time() - start_time
        duration_ms = round(duration * 1000, 2)
        duration_var.set(duration_ms)

        # Record to OTEL metrics layer
        MetricsProvider.record_latency(
            endpoint=request.path, 
            ms=duration_ms, 
            tags={"method": request.method, "status": response.status_code}
        )
        
        # Inject trace headers into response
        response['X-Request-ID'] = req_id
        response['X-Correlation-ID'] = corr_id
        # Set a generic Server header to prevent framework fingerprinting
        response['Server'] = 'Foudy-Edge'
        
        return response


class IdempotencyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method not in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return self.get_response(request)
            
        idempotency_key = request.headers.get('Idempotency-Key')
        if not idempotency_key:
            return self.get_response(request)

        cache_key = f"idemp:{idempotency_key}"
        cached_response = cache.get(cache_key)

        if cached_response:
            return JsonResponse(
                json.loads(cached_response['content']), 
                status=cached_response['status']
            )

        response = self.get_response(request)

        if 200 <= response.status_code < 300:
            try:
                # Store successful responses to prevent duplicate operations
                cache.set(cache_key, {
                    'content': response.content.decode('utf-8'),
                    'status': response.status_code
                }, timeout=86400) # 24 hours
            except Exception:
                pass # If it's not JSON/decodeable, we might just skip caching it

        return response
