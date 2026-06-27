from typing import List, Optional
from django.utils import timezone
from rooms.models import Room, RoomParticipant
from django.db import transaction

class RoomRepository:
    def create_room(self, host_user, max_participants=10, settings=None) -> Room:
        with transaction.atomic():
            room = Room.objects.create(
                status=Room.Status.CREATED,
                max_participants=max_participants,
                settings=settings or {}
            )
            RoomParticipant.objects.create(
                room=room,
                user=host_user,
                role=RoomParticipant.Role.HOST,
                status=RoomParticipant.Status.JOINING,
                joined_at=timezone.now()
            )
            return room

    def get_room(self, room_id: int) -> Optional[Room]:
        return Room.objects.filter(id=room_id).first()

    def update_status(self, room_id: int, status: str) -> None:
        Room.objects.filter(id=room_id).update(status=status)

    def close_room(self, room_id: int) -> None:
        Room.objects.filter(id=room_id).update(
            status=Room.Status.CLOSED,
            closed_at=timezone.now()
        )
        RoomParticipant.objects.filter(room_id=room_id, status__in=[
            RoomParticipant.Status.ACTIVE,
            RoomParticipant.Status.WAITING,
            RoomParticipant.Status.JOINING,
            RoomParticipant.Status.RECONNECTING
        ]).update(status=RoomParticipant.Status.DISCONNECTED, left_at=timezone.now())

    def destroy_room(self, room_id: int) -> None:
        Room.objects.filter(id=room_id).update(status=Room.Status.DESTROYED)

    def add_participant(self, room_id: int, user, role=RoomParticipant.Role.MEMBER) -> RoomParticipant:
        participant, created = RoomParticipant.objects.get_or_create(
            room_id=room_id, user=user,
            defaults={'role': role, 'status': RoomParticipant.Status.INVITED}
        )
        return participant

    def update_participant_status(self, room_id: int, user_id: int, status: str) -> None:
        RoomParticipant.objects.filter(room_id=room_id, user_id=user_id).update(status=status)

    def get_active_participants(self, room_id: int) -> List[RoomParticipant]:
        return list(RoomParticipant.objects.filter(
            room_id=room_id,
            status__in=[RoomParticipant.Status.ACTIVE, RoomParticipant.Status.JOINING, RoomParticipant.Status.WAITING, RoomParticipant.Status.RECONNECTING]
        ))
