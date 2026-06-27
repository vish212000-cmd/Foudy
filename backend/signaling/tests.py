from django.test import TestCase
from signaling.manager import PeerSessionManager, PeerSessionState, IllegalStateTransition
from signaling.services import SignalingService, UnauthorizedSignalingError, InvalidSignalingPayload
from unittest.mock import patch, MagicMock

class PeerSessionManagerTests(TestCase):
    def setUp(self):
        self.patcher = patch('signaling.repository.get_redis_client')
        self.mock_redis_client = self.patcher.start()
        self.mock_redis = MagicMock()
        self.mock_redis_client.return_value = self.mock_redis
        
        self.manager = PeerSessionManager()
        self.match_id = 123
        self.user_a_id = 1
        self.user_b_id = 2

    def tearDown(self):
        self.patcher.stop()

    def test_state_transitions(self):
        # Fake session creation
        self.mock_redis.hgetall.return_value = None
        self.manager.get_or_create_session(self.match_id, self.user_a_id, self.user_b_id)
        
        # Now mock it existing in CREATED state
        self.mock_redis.hgetall.return_value = {
            b"state": b"CREATED", b"user_a_id": b"1", b"user_b_id": b"2"
        }
        
        # Valid transition CREATED -> NEGOTIATING
        self.manager.mark_negotiating(self.match_id)
        
        # Mock it in NEGOTIATING
        self.mock_redis.hgetall.return_value[b"state"] = b"NEGOTIATING"
        
        # Valid transition NEGOTIATING -> CONNECTED
        self.manager.mark_connected(self.match_id)

    def test_illegal_transition(self):
        self.mock_redis.hgetall.return_value = {
            b"state": b"CREATED", b"user_a_id": b"1", b"user_b_id": b"2"
        }
        
        # CREATED -> CONNECTED is illegal
        with self.assertRaises(IllegalStateTransition):
            self.manager.mark_connected(self.match_id)


class SignalingServiceTests(TestCase):
    def setUp(self):
        self.patcher = patch('signaling.repository.get_redis_client')
        self.mock_redis_client = self.patcher.start()
        self.mock_redis = MagicMock()
        self.mock_redis_client.return_value = self.mock_redis
        
        # is_message_processed will return False (not processed) if sadd returns 1
        self.mock_redis.sadd.return_value = 1

        self.service = SignalingService()

    def tearDown(self):
        self.patcher.stop()

    @patch('signaling.services.SignalingService._route_message')
    def test_offer_creates_session_and_routes(self, mock_route):
        def mock_hgetall(key):
            if b"created" not in self.mock_redis.keys:
                self.mock_redis.keys.append(b"created")
                return None
            return {b"state": b"CREATED", b"user_a_id": b"1", b"user_b_id": b"2"}
            
        self.mock_redis.keys = []
        self.mock_redis.hgetall.side_effect = mock_hgetall
        
        payload = {
            "matchId": "123",
            "correlationId": "abc",
            "targetUserId": "2",
            "sdp": {}
        }
        
        # Send offer as user 1
        ack = self.service.process_event(1, "signaling.offer", payload)
        
        self.assertEqual(ack["status"], "ok")
        self.assertEqual(ack["correlationId"], "abc")
        
    @patch('signaling.services.SignalingService._route_message')
    def test_unauthorized_user(self, mock_route):
        self.mock_redis.hgetall.return_value = {
            b"state": b"CREATED", b"user_a_id": b"1", b"user_b_id": b"2"
        }
        
        payload = {
            "matchId": "123",
            "correlationId": "abc"
        }
        
        # Send answer as user 3 (unauthorized)
        with self.assertRaises(UnauthorizedSignalingError):
            self.service.process_event(3, "signaling.answer", payload)

    @patch('signaling.services.SignalingService._route_message')
    def test_media_update_routes(self, mock_route):
        def mock_hgetall(key):
            return {b"state": b"CONNECTED", b"user_a_id": b"1", b"user_b_id": b"2"}
        self.mock_redis.hgetall.side_effect = mock_hgetall
        
        payload = {
            "matchId": "123",
            "correlationId": "xyz",
            "cameraState": "OFF"
        }
        
        ack = self.service.process_event(1, "signaling.media_update", payload)
        
        self.assertEqual(ack["status"], "ok")
        mock_route.assert_called_with("2", "signaling.media_update", payload)

