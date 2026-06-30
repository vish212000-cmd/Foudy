from django.test import TestCase, override_settings
from unittest.mock import patch
from matching.state_machine import QueueState, QueueStateMachine
from matching.engine import CompatibilityEngine
import time

class StateMachineTests(TestCase):
    def test_valid_transitions(self):
        self.assertTrue(QueueStateMachine.can_transition(QueueState.IDLE, QueueState.QUEUED))
        self.assertTrue(QueueStateMachine.can_transition(QueueState.QUEUED, QueueState.MATCHING))
        self.assertTrue(QueueStateMachine.can_transition(QueueState.MATCHING, QueueState.MATCHED))
        
    def test_invalid_transitions(self):
        self.assertFalse(QueueStateMachine.can_transition(QueueState.QUEUED, QueueState.MATCHED))
        with self.assertRaises(ValueError):
            QueueStateMachine.validate_transition(QueueState.QUEUED, QueueState.MATCHED)

class EngineTests(TestCase):

    def test_score_calculation(self):
        user_a = {'preferences': {'interests': ['tech', 'gaming'], 'languages': ['en']}}
        user_b = {'preferences': {'interests': ['tech'], 'languages': ['en']}}
        
        score = CompatibilityEngine.calculate_score(user_a, user_b)
        self.assertEqual(score, 50) # 1 common interest (20) + language match (30)

    def test_relaxation_logic(self):
        now = int(time.time())
        # Score is 40. Base threshold is 50. Should fail initially.
        user_a = {'entry_time': now, 'preferences': {'interests': ['tech', 'music']}}
        user_b = {'entry_time': now, 'preferences': {'interests': ['tech', 'art']}}
        
        self.assertFalse(CompatibilityEngine.is_match(user_a, user_b))
        
        # Simulate 35 seconds passed (relaxation lowers threshold by 30 to 20)
        user_a['entry_time'] = now - 35
        user_b['entry_time'] = now - 35
        
        self.assertTrue(CompatibilityEngine.is_match(user_a, user_b))

from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from profiles.models import Profile
from django.urls import reverse

User = get_user_model()



class MockRedis:
    def __init__(self):
        self.data = {}
        self.zsets = {}

    def set(self, key, value, nx=False, ex=None):
        if nx and key in self.data:
            return None
        self.data[key] = value
        return True

    def delete(self, key):
        self.data.pop(key, None)

    def hgetall(self, key):
        val = self.data.get(key, {})
        return {k.encode('utf-8'): v.encode('utf-8') for k, v in val.items()}

    def hset(self, key, key2=None, value=None, mapping=None):
        if key not in self.data:
            self.data[key] = {}
        if mapping:
            for k, v in mapping.items():
                self.data[key][k] = v
        else:
            self.data[key][key2] = value

    def expire(self, key, time):
        pass

    def zadd(self, key, mapping):
        if key not in self.zsets:
            self.zsets[key] = {}
        for member, score in mapping.items():
            self.zsets[key][member] = score

    def zrem(self, key, member):
        if key in self.zsets:
            self.zsets[key].pop(member, None)

    def zrange(self, key, start, end):
        if key not in self.zsets:
            return []
        items = sorted(self.zsets[key].items(), key=lambda x: x[1])
        slice_end = end + 1 if end != -1 else None
        return [k.encode('utf-8') for k, v in items[start:slice_end]]

    def zcard(self, key):
        return len(self.zsets.get(key, {}))

    def flushdb(self):
        self.data = {}
        self.zsets = {}

@override_settings(CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}})
class MatchmakingRuntimeTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        try:
            cache.clear()
        except:
            pass # ignore redis errors on default cache
            
        self.mock_redis = MockRedis()
        self.patcher = patch('matching.repository.get_redis_client', return_value=self.mock_redis)
        self.patcher.start()
        
        # also patch ModerationRedisClient which is called in Join Queue
        self.mod_patcher = patch('matching.manager.ModerationRedisClient')
        self.mock_mod_client = self.mod_patcher.start()

        self.notify_patcher = patch('matching.manager.QueueManager._notify_user')
        self.mock_notify_user = self.notify_patcher.start()
        
        self.client = APIClient()
        self.join_url = reverse('join-queue')
        self.leave_url = reverse('leave-queue')
        
        self.user = User.objects.create_user(
            email='testmatcher@foudy.com',
            password='SecurePassword123!'
        )
        # Create profile with enough info to get score > 70
        Profile.objects.create(
            user=self.user, 
            display_name="Test Matcher",
            country="US",
            bio="Test bio for high score",
            interests=["tech", "gaming"],
            keywords=["dev", "python"],
            languages=["en"]
        )
        self.client.force_authenticate(user=self.user)

    def tearDown(self):
        self.patcher.stop()
        self.mod_patcher.stop()
        self.notify_patcher.stop()

    def test_join_queue(self):
        response = self.client.post(self.join_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['message'], 'Successfully joined queue.')
        
    def test_join_queue_already_queued(self):
        self.client.post(self.join_url)
        response = self.client.post(self.join_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['error'], 'You are already in the queue.')
        
    def test_leave_queue(self):
        self.client.post(self.join_url)
        response = self.client.post(self.leave_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['message'], 'Successfully left queue.')

    def test_leave_queue_not_in_queue(self):
        response = self.client.post(self.leave_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['error'], 'Not in queue.')
