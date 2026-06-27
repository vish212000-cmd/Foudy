from django.test import TestCase
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
    def test_queue_join_refreshes_blocks(self):
        self.mock_redis.sismember.return_value = False
        
        with patch('matching.manager.ModerationRedisClient') as MockClient:
            mock_client_instance = MockClient.return_value
            self.manager.join_queue(self.user_id, {})
            mock_client_instance.refresh_block_cache.assert_called_with(self.user_id)

    @patch('matching.engine.ModerationRedisClient')
    def test_blocked_users_are_not_matched(self, MockClient):
        mock_mod_client = MockClient.return_value
        # Mock that user 1 blocked user 2
        mock_mod_client.is_blocked.side_effect = lambda u1, u2: (u1 == 1 and u2 == 2) or (u1 == 2 and u2 == 1)
        
        user1 = {'id': 1, 'preferences': {}}
        user2 = {'id': 2, 'preferences': {}}
        
        match = self.engine.is_match(user1, user2)
        self.assertFalse(match)

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
