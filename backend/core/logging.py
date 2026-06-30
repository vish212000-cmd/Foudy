import logging
import json
from datetime import datetime

from .context import correlation_id_var, user_id_var, session_id_var, ip_var, duration_var

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "correlation_id": correlation_id_var.get(),
            "user_id": user_id_var.get(),
            "session_id": session_id_var.get(),
            "ip": ip_var.get(),
            "duration_ms": duration_var.get(),
        }
            
        # Include extra context added via standard logging 'extra' parameter
        # In Python logging, 'extra' fields are injected directly into the record object
        # We need a defined set of known attributes to ignore them.
        standard_attrs = {
            'args', 'asctime', 'created', 'exc_info', 'exc_text', 'filename',
            'funcName', 'levelname', 'levelno', 'lineno', 'module',
            'msecs', 'message', 'msg', 'name', 'pathname', 'process',
            'processName', 'relativeCreated', 'stack_info', 'thread', 'threadName',
            'taskName', 'request_id'
        }
        
        extra_attrs = {k: v for k, v in record.__dict__.items() if k not in standard_attrs}
        log_record.update(extra_attrs)
            
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_record, default=str)
