from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from profiles.models import Profile
from .manager import QueueManager

class JoinQueueView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = get_object_or_404(Profile, user=user)
        
        # Build preferences dictionary from profile
        preferences = {
            'interests': profile.interests or [],
            'keywords': profile.keywords or [],
            'languages': profile.languages or [],
            'country': profile.country or '',
            'gender_preference': profile.gender_preference or ''
        }
        
        score = profile.completion_score
        
        manager = QueueManager()
        success, message = manager.join_queue(user.id, preferences, score)
        
        if success:
            return Response({"status": "success", "message": message})
        else:
            return Response({"status": "error", "error": message}, status=status.HTTP_400_BAD_REQUEST)

class LeaveQueueView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        manager = QueueManager()
        success, message = manager.leave_queue(request.user.id)
        
        if success:
            return Response({"status": "success", "message": message})
        else:
            return Response({"status": "error", "error": message}, status=status.HTTP_400_BAD_REQUEST)
