import logging
import json
from typing import Any, Dict

class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def _log(self, level: int, message: str, **kwargs: Any):
        log_entry = {
            "message": message,
            **kwargs
        }
        self.logger.log(level, json.dumps(log_entry))

    def info(self, message: str, **kwargs: Any):
        self._log(logging.INFO, message, **kwargs)

    def error(self, message: str, **kwargs: Any):
        self._log(logging.ERROR, message, **kwargs)
        
    def warning(self, message: str, **kwargs: Any):
        self._log(logging.WARNING, message, **kwargs)

def get_logger(name: str) -> StructuredLogger:
    return StructuredLogger(name)
