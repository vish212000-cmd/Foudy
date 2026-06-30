from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch

from .models import Block, Report, AuditLog
from .services import BlockService, ReportService, ModerationError

User = get_user_model()

from django.test import TestCase, override_settings

@override_settings(CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}})
class ModerationServiceTests(TestCase):
    def setUp(self):
        self.redis_patcher = patch('moderation.services.redis.Redis.from_url')
        self.mock_redis = self.redis_patcher.start()
        self.addCleanup(self.redis_patcher.stop)

        self.user1 = User.objects.create_user(email="user1@example.com", password="pw")
        self.user2 = User.objects.create_user(email="user2@example.com", password="pw")
        self.block_service = BlockService()
        self.report_service = ReportService()
        
        self.client = APIClient()
        self.client.force_authenticate(user=self.user1)

    @patch('moderation.services.ModerationRedisClient.refresh_block_cache')
    @patch('moderation.services.BlockService._terminate_active_session')
    def test_block_user(self, mock_terminate, mock_refresh):
        self.block_service.block_user(self.user1.id, self.user2.id)
        
        self.assertTrue(Block.objects.filter(blocker=self.user1, blocked=self.user2).exists())
        self.assertTrue(AuditLog.objects.filter(action=AuditLog.Action.BLOCK).exists())
        
        # Test blocking self
        with self.assertRaises(ModerationError):
            self.block_service.block_user(self.user1.id, self.user1.id)

    def test_report_user(self):
        mock_redis_instance = self.mock_redis.return_value
        mock_redis_instance.incr.return_value = 1
        mock_redis_instance.exists.return_value = False
        
        report = self.report_service.report_user(self.user1.id, self.user2.id, "Spam", "Some details")
        self.assertEqual(report.reason, "Spam")
        self.assertTrue(AuditLog.objects.filter(action=AuditLog.Action.REPORT).exists())

        # Duplicate report
        mock_redis_instance.exists.return_value = True
        with self.assertRaises(ModerationError) as e:
            self.report_service.report_user(self.user1.id, self.user2.id, "Spam")
        self.assertEqual(e.exception.code, 409)

    def test_block_api(self):
        response = self.client.post(f'/api/v1/moderation/block/{self.user2.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Block.objects.filter(blocker=self.user1, blocked=self.user2).exists())

    def test_report_api(self):
        mock_redis_instance = self.mock_redis.return_value
        mock_redis_instance.incr.return_value = 1
        mock_redis_instance.exists.return_value = False

        response = self.client.post(f'/api/v1/moderation/report/{self.user2.id}/', {
            "reason": "Harassment",
            "details": "Said mean things"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Report.objects.filter(reporter=self.user1, reported_user=self.user2).exists())
