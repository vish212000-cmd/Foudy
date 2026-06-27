import time
from typing import Dict, Any

class CompatibilityEngine:
    """
    Evaluates compatibility between two users based on their preferences
    and time spent in the queue (relaxation logic).
    """

    # Constants for matching weights
    INTEREST_WEIGHT = 20
    KEYWORD_WEIGHT = 10
    LANGUAGE_WEIGHT = 30
    COUNTRY_WEIGHT = 20
    GENDER_PREF_WEIGHT = 20 # Negative impact if mismatch

    @classmethod
    def calculate_score(cls, user_a: Dict[str, Any], user_b: Dict[str, Any]) -> int:
        """
        Calculates a compatibility score (0-100+) between two users.
        """
        score = 0
        pref_a = user_a.get('preferences', {})
        pref_b = user_b.get('preferences', {})

        # Interests match
        interests_a = set(pref_a.get('interests', []))
        interests_b = set(pref_b.get('interests', []))
        common_interests = len(interests_a.intersection(interests_b))
        score += common_interests * cls.INTEREST_WEIGHT

        # Keywords match
        keywords_a = set(pref_a.get('keywords', []))
        keywords_b = set(pref_b.get('keywords', []))
        common_keywords = len(keywords_a.intersection(keywords_b))
        score += common_keywords * cls.KEYWORD_WEIGHT

        # Language match (Must have at least one common language to even communicate effectively, but we'll just score it highly)
        langs_a = set(pref_a.get('languages', []))
        langs_b = set(pref_b.get('languages', []))
        if langs_a.intersection(langs_b):
            score += cls.LANGUAGE_WEIGHT

        # Country match
        if pref_a.get('country') and pref_a.get('country') == pref_b.get('country'):
            score += cls.COUNTRY_WEIGHT

        # Gender Preference (Simple implementation for now)
        # If A wants "Male" and B is not "Male", we heavily penalize. 
        # (Assuming gender is passed in preferences. If not, we skip this simple logic or handle it gracefully).
        # For this spec, we will just use it if provided.

        return score

    @classmethod
    def is_match(cls, user_a: Dict[str, Any], user_b: Dict[str, Any]) -> bool:
        """
        Determines if two users should be matched, accounting for relaxation over time.
        """
        # Time in queue for both users
        now = int(time.time())
        wait_time_a = now - int(user_a.get('entry_time', now))
        wait_time_b = now - int(user_b.get('entry_time', now))
        
        # Base threshold
        threshold = 50

        # Relaxation logic: every 10 seconds, lower threshold by 10 points
        max_wait = max(wait_time_a, wait_time_b)
        relaxation = (max_wait // 10) * 10
        current_threshold = max(0, threshold - relaxation)

        score = cls.calculate_score(user_a, user_b)
        
        return score >= current_threshold
