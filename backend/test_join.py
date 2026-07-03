import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'foudy_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from matching.views import JoinQueueView
from django.contrib.auth import get_user_model
from profiles.models import Profile

User = get_user_model()

# Ensure we have a user
user = User.objects.first()
if not user:
    user = User.objects.create_user(username='test_join_user', email='test@join.com', password='password123')
    
# Ensure user has a profile
if not hasattr(user, 'profile'):
    Profile.objects.create(user=user)


print(f"Testing with user: {user.email}")

from django.conf import settings
settings.CACHES['default'] = {
    'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
}

import fakeredis
fake_redis = fakeredis.FakeRedis(decode_responses=True)

import core.redis_client
core.redis_client.get_redis_client = lambda decode_responses=True: fake_redis


from rest_framework.test import APIClient
client = APIClient()
client.force_authenticate(user=user)
from unittest.mock import patch, PropertyMock
with patch('profiles.models.Profile.completion_score', new_callable=PropertyMock) as mock_score:
    mock_score.return_value = 100
    
    response = client.post('/api/v1/matching/join/', {}, format='json')
    print("First Response Status:", response.status_code)
    
    print("\n--- SECOND REQUEST ---")
    response2 = client.post('/api/v1/matching/join/', {}, format='json')
    print("Second Response Status:", response2.status_code)
    print("Second Response Data:", response2.data)

