from django.core.cache import cache
from django.http import JsonResponse
import json

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
