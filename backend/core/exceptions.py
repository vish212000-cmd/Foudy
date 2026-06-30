import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from .context import correlation_id_var

logger = logging.getLogger('foudy')

def custom_exception_handler(exc, context):
    """
    Custom exception handler that logs all exceptions cleanly, including DRF and standard Django exceptions.
    Provides a standardized error response body.
    """
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        response.data['status_code'] = response.status_code
        response.data['correlation_id'] = correlation_id_var.get()
    else:
        # This is an unhandled exception (e.g. 500 error)
        logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True, extra={
            'endpoint': context['request'].build_absolute_uri(),
            'method': context['request'].method,
        })
        
        data = {
            'detail': 'A server error occurred.',
            'status_code': 500,
            'correlation_id': correlation_id_var.get()
        }
        response = Response(data, status=500)

    return response
