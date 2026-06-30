from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from profiles.models import Profile
from PIL import Image
import io

User = get_user_model()

@override_settings(CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}})
class ProfileRuntimeTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        
        self.client = APIClient()
        self.me_url = reverse('current_user')
        self.avatar_url = reverse('avatar_upload')
        
        self.user = User.objects.create_user(
            email='testprofile@foudy.com',
            password='SecurePassword123!'
        )
        Profile.objects.create(user=self.user, display_name="Initial Name")
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('profile', response.data)
        self.assertEqual(response.data['profile']['completion_score'], 15)

    def test_update_profile(self):
        payload = {
            'display_name': 'New Name',
            'bio': 'New Bio',
            'country': 'US',
            'gender_preference': 'All',
            'interests': ['coding', 'music'],
            'languages': ['en', 'es'],
            'keywords': ['django', 'react']
        }
        
        response = self.client.patch(self.me_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify persistence
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.display_name, 'New Name')
        self.assertEqual(self.user.profile.country, 'US')
        self.assertEqual(self.user.profile.interests, ['coding', 'music'])
        self.assertEqual(self.user.profile.languages, ['en', 'es'])
        
        # Check completion score
        # display_name (15) + interests (25) + keywords (15) + languages (15) + country (10) + bio (10) = 90
        self.assertEqual(self.user.profile.completion_score, 90)

    def test_avatar_upload_and_processing(self):
        # Create a dummy image
        file_obj = io.BytesIO()
        image = Image.new("RGB", (800, 600), "white")
        image.save(file_obj, format="JPEG")
        file_obj.seek(0)
        
        avatar_file = SimpleUploadedFile(
            name='test_avatar.jpg',
            content=file_obj.read(),
            content_type='image/jpeg'
        )
        
        response = self.client.post(self.avatar_url, {'avatar': avatar_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify persistence and processing
        self.user.profile.refresh_from_db()
        self.assertTrue(self.user.profile.avatar.name.endswith('.webp'))
        
        # Check completion score now includes avatar (+10) and display_name (+15)
        self.assertEqual(self.user.profile.completion_score, 25)

    def test_update_settings(self):
        payload = {
            'privacy_settings': {
                'show_online_status': False,
                'allow_messages_from_strangers': True
            },
            'notification_settings': {
                'email_notifications': False,
                'push_notifications': True
            }
        }
        
        response = self.client.patch(self.me_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.privacy_settings['show_online_status'], False)
        self.assertEqual(self.user.profile.privacy_settings['allow_messages_from_strangers'], True)
        self.assertEqual(self.user.profile.notification_settings['email_notifications'], False)
        self.assertEqual(self.user.profile.notification_settings['push_notifications'], True)
