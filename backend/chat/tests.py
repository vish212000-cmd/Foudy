from django.test import TestCase
from unittest.mock import patch, MagicMock
from .services import ChatService, ChatError
from signaling.manager import PeerSessionState

class ChatServiceTests(TestCase):
    def setUp(self):
        self.service = ChatService()
        self.user_a_id = 1
        self.user_b_id = 2
        self.match_id = 100

    @patch('chat.services.ChatRepository.is_message_processed')
    @patch('chat.services.PeerRepository.get_session')
    @patch('chat.services.ChatRepository.check_rate_limit')
    @patch('chat.services.async_to_sync')
    def test_message_validation(self, mock_async_to_sync, mock_rate_limit, mock_get_session, mock_processed):
        mock_processed.return_value = False
        mock_rate_limit.return_value = True
        mock_get_session.return_value = {
            "state": PeerSessionState.CONNECTED,
            "user_a_id": str(self.user_a_id),
            "user_b_id": str(self.user_b_id)
        }

        # Valid message
        payload = {
            "correlationId": "123",
            "matchId": self.match_id,
            "content": "Hello world"
        }
        ack = self.service.process_event(self.user_a_id, "chat.message", payload)
        self.assertEqual(ack["status"], "ok")

        # HTML Escaping
        payload["correlationId"] = "124"
        payload["content"] = "<script>alert(1)</script>"
        self.service.process_event(self.user_a_id, "chat.message", payload)
        
        # Unauthorized sender
        with self.assertRaises(ChatError):
            self.service.process_event(999, "chat.message", payload)

    @patch('chat.services.ChatRepository.is_message_processed')
    @patch('chat.services.ChatRepository.check_rate_limit')
    def test_rate_limit(self, mock_rate_limit, mock_processed):
        mock_processed.return_value = False
        mock_rate_limit.return_value = False
        payload = {
            "correlationId": "123",
            "matchId": self.match_id,
            "content": "Hello"
        }
        with self.assertRaises(ChatError) as e:
            self.service.process_event(self.user_a_id, "chat.message", payload)
        self.assertEqual(e.exception.code, 429)

    @patch('chat.services.ChatRepository.is_message_processed')
    def test_deduplication(self, mock_processed):
        mock_processed.return_value = True
        payload = {
            "correlationId": "dup-id",
            "matchId": self.match_id,
        }
        ack = self.service.process_event(self.user_a_id, "chat.message", payload)
        self.assertTrue(ack.get("duplicate"))
