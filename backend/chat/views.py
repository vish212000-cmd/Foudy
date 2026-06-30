from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from .models import Message
from .serializers import MessageSerializer

class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

class RoomMessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessagePagination

    def get_queryset(self):
        room_id = self.kwargs['room_id']
        
        # Object-level security: Ensure user is a participant
        from rooms.models import RoomParticipant
        from rest_framework.exceptions import PermissionDenied
        
        if not RoomParticipant.objects.filter(room_id=room_id, user=self.request.user).exists():
            raise PermissionDenied("You are not a participant in this room.")
            
        return Message.objects.filter(room_id=room_id).select_related('sender', 'sender__profile').order_by('-created_at')
