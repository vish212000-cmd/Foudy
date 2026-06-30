from rest_framework import serializers
from .models import Room, RoomParticipant
from accounts.serializers import UserSerializer

class RoomParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = RoomParticipant
        fields = ['id', 'room', 'user', 'role', 'status', 'joined_at', 'left_at', 'created_at', 'updated_at']

class RoomSerializer(serializers.ModelSerializer):
    participants = RoomParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'status', 'max_participants', 'closed_at', 'settings', 'created_at', 'updated_at', 'participants']
