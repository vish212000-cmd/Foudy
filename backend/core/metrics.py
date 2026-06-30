import logging
from typing import Dict, Optional
from opentelemetry import trace, metrics

# Global internal logger
logger = logging.getLogger("foudy.metrics")

# Optional: Get OTEL meter/tracer if configured, otherwise fallback to no-op
meter = metrics.get_meter("foudy.core")
tracer = trace.get_tracer("foudy.core")

class MetricsProvider:
    """
    Abstract metrics service layer.
    This prevents tight coupling to Prometheus or Datadog directly.
    """

    @classmethod
    def record_latency(cls, endpoint: str, ms: float, tags: Optional[Dict] = None):
        """Record API or WebSocket latency"""
        logger.info(f"metric=latency endpoint={endpoint} value={ms}ms tags={tags}")
        # Here we would update OTEL histograms
        
    @classmethod
    def increment_counter(cls, name: str, tags: Optional[Dict] = None):
        """Increment an abstract counter"""
        logger.info(f"metric=counter name={name} count=1 tags={tags}")
        
    @classmethod
    def record_gauge(cls, name: str, value: float, tags: Optional[Dict] = None):
        """Record an absolute gauge value (e.g. queue depth)"""
        logger.info(f"metric=gauge name={name} value={value} tags={tags}")
