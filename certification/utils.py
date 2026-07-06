import time
import requests
from typing import Callable, Any

def with_retry(max_retries: int = 3, base_delay: float = 1.0):
    """
    Retry decorator for transient network failures.
    Does not retry 5xx, Auth failures, or app exceptions.
    """
    def decorator(func: Callable) -> Callable:
        def wrapper(*args, **kwargs) -> Any:
            retries = 0
            while retries <= max_retries:
                try:
                    result = func(*args, **kwargs)
                    if hasattr(result, "status_code"):
                        if result.status_code >= 500:
                            # Do not retry 500s per rule 5
                            return result
                        if result.status_code in (401, 403):
                            # Do not retry auth failures
                            return result
                    return result
                except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                    if retries == max_retries:
                        raise e
                    print(f"Transient network error: {e}. Retrying in {base_delay * (2 ** retries)}s...")
                    time.sleep(base_delay * (2 ** retries))
                    retries += 1
                except Exception as e:
                    # Do not retry application exceptions
                    raise e
        return wrapper
    return decorator
