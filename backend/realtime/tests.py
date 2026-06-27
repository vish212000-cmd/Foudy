from django.test import TestCase
from realtime.repository import RedisPresenceRepository, PresenceState
from realtime.recovery import SessionRecovery
from unittest.mock import patch, MagicMock

class PresenceRepositoryTests(TestCase):
    def setUp(self):
        self.patcher = patch('realtime.repository.get_redis_client')
        self.mock_redis_client = self.patcher.start()
        
        # Setup mock behavior
        self.mock_redis = MagicMock()
        self.mock_redis_client.return_value = self.mock_redis
        
        # When calling sadd, pretend the set size increased (return 1) if not already there, 
        # but to keep it simple, we'll just mock the repository methods directly or mock the redis responses.
        # Actually, let's just patch redis.Redis internally or mock sadd/srem.
        self.mock_redis.sadd.side_effect = [1, 1]
        self.mock_redis.srem.side_effect = [1, 1]
        self.mock_redis.scard.side_effect = [0, 1, 1, 0]

        self.repo = RedisPresenceRepository()
        self.user_id = 999
        self.conn_a = "conn_a"
        self.conn_b = "conn_b"

    def tearDown(self):
        self.patcher.stop()

    def test_multi_tab_tracking(self):
        # Tab A connects
        is_new = self.repo.add_connection(self.user_id, self.conn_a)
        self.assertTrue(is_new)
        
        # Tab B connects
        is_new = self.repo.add_connection(self.user_id, self.conn_b)
        self.assertFalse(is_new) # Not new, already online
        
        # Tab A disconnects
        is_last = self.repo.remove_connection(self.user_id, self.conn_a)
        self.assertFalse(is_last) # Still Tab B open
        
        # Tab B disconnects
        is_last = self.repo.remove_connection(self.user_id, self.conn_b)
        self.assertTrue(is_last) # No tabs open, user is disconnected

class SessionRecoveryTests(TestCase):
    def setUp(self):
        self.patcher = patch('realtime.repository.get_redis_client')
        self.mock_redis_client = self.patcher.start()
        self.mock_redis = MagicMock()
        self.mock_redis_client.return_value = self.mock_redis
        
        self.recovery = SessionRecovery()
        self.user_id = 999
        
    def tearDown(self):
        self.patcher.stop()
        
    @patch('matching.repository.QueueRepository.get_user_state')
    def test_recovery_success(self, mock_get_state):
        mock_get_state.return_value = {'state': 'QUEUED'}
        
        success, state, payload = self.recovery.attempt_recovery(self.user_id)
        
        self.assertTrue(success)
        self.assertEqual(state, PresenceState.MATCHING)

    @patch('matching.repository.QueueRepository.get_user_state')
    def test_recovery_failure(self, mock_get_state):
        mock_get_state.return_value = None
        
        success, state, payload = self.recovery.attempt_recovery(self.user_id)
        
        self.assertFalse(success)
