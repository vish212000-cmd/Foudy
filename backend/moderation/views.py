from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .services import BlockService, ReportService, ModerationError, ModerationRedisClient
from .models import Block

User = get_user_model()

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, target_id):
        try:
            target = get_object_or_404(User, id=target_id)
            BlockService().block_user(request.user.id, target.id)
            return Response({"status": "blocked"}, status=status.HTTP_200_OK)
        except ModerationError as e:
            return Response({"error": e.message}, status=e.code)

class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, target_id):
        BlockService().unblock_user(request.user.id, target_id)
        return Response({"status": "unblocked"}, status=status.HTTP_200_OK)

class ReportUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, target_id):
        reason = request.data.get("reason")
        details = request.data.get("details", "")
        
        if not reason:
            return Response({"error": "Reason is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target = get_object_or_404(User, id=target_id)
            ReportService().report_user(request.user.id, target.id, reason, details)
            return Response({"status": "reported"}, status=status.HTTP_201_CREATED)
        except ModerationError as e:
            return Response({"error": e.message}, status=e.code)

class BlockedUsersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        blocks = Block.objects.filter(blocker=request.user).select_related('blocked')
        data = [
            {
                "id": b.blocked.id,
                "username": b.blocked.username,
                "created_at": b.created_at
            } for b in blocks
        ]
        return Response(data, status=status.HTTP_200_OK)
