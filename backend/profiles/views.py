from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from accounts.serializers import UserSerializer
from accounts.models import User
from rest_framework.parsers import MultiPartParser, FormParser
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(request=UserSerializer, responses={200: UserSerializer})
    def patch(self, request):
        user = request.user
        
        updatable_fields = [
            'display_name', 'bio', 'interests', 'keywords', 
            'languages', 'country', 'gender_preference', 
            'privacy_settings', 'notification_settings'
        ]

        for field in updatable_fields:
            if field in request.data:
                setattr(user.profile, field, request.data[field])
            
        user.profile.save()
        
        serializer = UserSerializer(user)
        return Response(serializer.data)

class AvatarUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(responses={200: UserSerializer})
    def post(self, request):
        if 'avatar' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        avatar_file = request.FILES['avatar']
        
        # Security: validate file size (5MB max)
        if avatar_file.size > 5 * 1024 * 1024:
            return Response({'error': 'File too large. Maximum size is 5MB.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Security: validate mime type
        allowed_mimes = ['image/jpeg', 'image/png', 'image/webp']
        if avatar_file.content_type not in allowed_mimes:
            return Response({'error': 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            img = Image.open(avatar_file)
            # Crop to square and resize
            min_dim = min(img.size)
            left = (img.width - min_dim) / 2
            top = (img.height - min_dim) / 2
            right = (img.width + min_dim) / 2
            bottom = (img.height + min_dim) / 2
            
            img = img.crop((left, top, right, bottom))
            img = img.resize((512, 512), Image.Resampling.LANCZOS)
            
            output = BytesIO()
            img.save(output, format='WebP', quality=85)
            output.seek(0)
            
            webp_file = InMemoryUploadedFile(
                output, 'ImageField', f"{request.user.id}_avatar.webp", 'image/webp',
                sys.getsizeof(output), None
            )
            
            request.user.profile.avatar = webp_file
            request.user.profile.save()
            
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StatsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: dict})
    def get(self, request):
        return Response({
            "rooms_joined": 0,
            "messages_sent": 0,
            "total_match_time": 0
        })
