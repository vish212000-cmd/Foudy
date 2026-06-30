import contextvars

correlation_id_var = contextvars.ContextVar('correlation_id', default=None)
user_id_var = contextvars.ContextVar('user_id', default=None)
session_id_var = contextvars.ContextVar('session_id', default=None)
ip_var = contextvars.ContextVar('ip', default=None)
duration_var = contextvars.ContextVar('duration', default=None)

