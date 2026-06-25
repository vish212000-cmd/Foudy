from typing import Callable, Any, Dict
from django.dispatch import Signal

class EventBus:
    _signals: Dict[str, Signal] = {}

    @classmethod
    def _get_signal(cls, event_name: str) -> Signal:
        if event_name not in cls._signals:
            cls._signals[event_name] = Signal()
        return cls._signals[event_name]

    @classmethod
    def subscribe(cls, event_name: str, handler: Callable):
        signal = cls._get_signal(event_name)
        signal.connect(handler)

    @classmethod
    def publish(cls, event_name: str, sender: Any = None, **kwargs):
        signal = cls._get_signal(event_name)
        signal.send(sender=sender, **kwargs)
