from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core import mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from unittest.mock import patch, MagicMock

User = get_user_model()

@override_settings(CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}})
class RegistrationRuntimeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.verify_request_url = reverse('email_verify_request')
        self.verify_confirm_url = reverse('email_verify_confirm')

        self.valid_payload = {
            'email': 'test@foudy.com',
            'password': 'SecurePassword123!',
            'display_name': 'Test User'
        }

    @patch('accounts.views.redis_client')
    def test_user_can_register(self, mock_redis):
        response = self.client.post(self.register_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access_token', response.data)
        
        # Verify user created
        user = User.objects.get(email=self.valid_payload['email'])
        self.assertTrue(user.check_password(self.valid_payload['password']))
        self.assertFalse(user.is_email_verified)
        
    @patch('accounts.views.redis_client')
    def test_validation_works(self, mock_redis):
        # Missing password
        response = self.client.post(self.register_url, {'email': 'test@foudy.com', 'display_name': 'Test'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

        # Invalid email
        response = self.client.post(self.register_url, {'email': 'invalid-email', 'password': 'Pass', 'display_name': 'Test'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    @patch('accounts.views.redis_client')
    def test_duplicate_email_handling_works(self, mock_redis):
        self.client.post(self.register_url, self.valid_payload, format='json')
        response = self.client.post(self.register_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    @patch('accounts.views.redis_client')
    def test_verification_email_is_sent_through_resend(self, mock_redis):
        # Register user and get token
        response = self.client.post(self.register_url, self.valid_payload, format='json')
        access_token = response.data['access_token']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        
        # Request Verification Email
        response = self.client.post(self.verify_request_url, {'email': self.valid_payload['email']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Outbox should have 1 email
        self.assertEqual(len(mail.outbox), 1)
        email_message = mail.outbox[0]
        self.assertEqual(email_message.to, [self.valid_payload['email']])
        self.assertIn('Verify', email_message.subject)
        self.assertTrue(mock_redis.setex.called)

    @patch('accounts.views.redis_client')
    def test_verification_link_works(self, mock_redis):
        # Register user
        response = self.client.post(self.register_url, self.valid_payload, format='json')
        user = User.objects.get(email=self.valid_payload['email'])
        uid_b64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = 'fake-secure-token'
        
        # Mock redis returning the user ID
        mock_redis.get.return_value = str(user.id).encode('utf-8')
        
        # Confirm email
        response = self.client.post(self.verify_confirm_url, {'uid': uid_b64, 'token': token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)
        self.assertTrue(mock_redis.delete.called)
        
        # Try to confirm again (mock redis returning None)
        mock_redis.get.return_value = None
        response = self.client.post(self.verify_confirm_url, {'uid': uid_b64, 'token': token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

@override_settings(CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}})
class LoginRuntimeTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        
        self.client = APIClient()
        self.login_url = reverse('login')
        self.refresh_url = reverse('refresh')
        self.logout_url = reverse('logout')
        self.logout_all_url = reverse('logout_all')

        self.valid_payload = {
            'email': 'testlogin@foudy.com',
            'password': 'SecurePassword123!',
        }
        
        self.user = User.objects.create_user(
            email=self.valid_payload['email'],
            password=self.valid_payload['password']
        )

    def test_login_success(self):
        response = self.client.post(self.login_url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        
        # Check refresh cookie is set
        self.assertIn('refresh_token', response.cookies)
        
        # Check session is created
        from accounts.models import UserSession
        self.assertEqual(UserSession.objects.filter(user=self.user).count(), 1)

    def test_invalid_credentials(self):
        response = self.client.post(self.login_url, {'email': self.valid_payload['email'], 'password': 'wrong'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_refresh_token_works(self):
        # Login to get refresh token
        response = self.client.post(self.login_url, self.valid_payload, format='json')
        refresh_token = response.cookies['refresh_token'].value
        
        # Setup cookie for refresh endpoint
        self.client.cookies['refresh_token'] = refresh_token
        
        refresh_response = self.client.post(self.refresh_url, {}, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', refresh_response.data)

    def test_logout_invalidates_token(self):
        # Login
        response = self.client.post(self.login_url, self.valid_payload, format='json')
        access_token = response.data['access_token']
        refresh_token = response.cookies['refresh_token'].value
        
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        self.client.cookies['refresh_token'] = refresh_token
        
        # Logout
        logout_response = self.client.post(self.logout_url, {}, format='json')
        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify session is revoked
        from accounts.models import UserSession
        session = UserSession.objects.filter(user=self.user).first()
        self.assertTrue(session.is_revoked)
        
        # Try refresh
        refresh_response = self.client.post(self.refresh_url, {}, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_all_devices(self):
        # Create two sessions via login
        self.client.post(self.login_url, self.valid_payload, format='json')
        
        client2 = APIClient()
        response2 = client2.post(self.login_url, self.valid_payload, format='json')
        access_token = response2.data['access_token']
        
        from accounts.models import UserSession
        self.assertEqual(UserSession.objects.filter(user=self.user, is_revoked=False).count(), 2)
        
        client2.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        logout_all_response = client2.post(self.logout_all_url, {}, format='json')
        self.assertEqual(logout_all_response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify all sessions are revoked
        self.assertEqual(UserSession.objects.filter(user=self.user, is_revoked=False).count(), 0)
