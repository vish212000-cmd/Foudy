from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Room, RoomParticipant
from .serializers import RoomSerializer, RoomParticipantSerializer

class RoomPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class RoomViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Room.objects.prefetch_related('participants__user__profile')
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = RoomPagination

    def get_queryset(self):
        qs = super().get_queryset()
        
        # Object-level security: Users can only see rooms they participate in
        qs = qs.filter(participants__user=self.request.user).distinct()
        
        if self.action == 'list':
            qs = qs.filter(status=Room.Status.ACTIVE)
        return qs

    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        room = self.get_object()
        participants = RoomParticipant.objects.filter(room=room).select_related('user', 'user__profile')
        serializer = RoomParticipantSerializer(participants, many=True)
        return Response(serializer.data)
