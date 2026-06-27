class GroupEventDispatcher:
    """Routes realtime group call events (signaling, media state)."""
    
    def __init__(self, consumer):
        self.consumer = consumer

    async def dispatch(self, user_id: int, event: str, payload: dict):
        if event == 'group.join':
            room_id = payload.get('room_id')
            # Broadcasting join to all others in the room channel
            await self.consumer.channel_layer.group_send(
                f"room_{room_id}",
                {
                    "type": "broadcast_message",
                    "message": {
                        "event": "group.participant_joined",
                        "payload": {"user_id": user_id}
                    }
                }
            )

        elif event == 'group.signal':
            # Mesh signaling requires routing an offer/answer to a specific peer
            target_id = payload.get('target_id')
            room_id = payload.get('room_id')
            signal_data = payload.get('signal')
            
            await self.consumer.channel_layer.group_send(
                f"user_{target_id}",
                {
                    "type": "realtime_event",
                    "event": {
                        "event": "group.signal_received",
                        "payload": {
                            "from_user_id": user_id,
                            "room_id": room_id,
                            "signal": signal_data
                        }
                    }
                }
            )

        elif event == 'group.media_state':
            room_id = payload.get('room_id')
            await self.consumer.channel_layer.group_send(
                f"room_{room_id}",
                {
                    "type": "broadcast_message",
                    "message": {
                        "event": "group.media_state_changed",
                        "payload": {
                            "user_id": user_id,
                            "audio": payload.get('audio'),
                            "video": payload.get('video')
                        }
                    }
                }
            )
            
        elif event == 'group.active_speaker':
            room_id = payload.get('room_id')
            await self.consumer.channel_layer.group_send(
                f"room_{room_id}",
                {
                    "type": "broadcast_message",
                    "message": {
                        "event": "group.active_speaker_changed",
                        "payload": {
                            "user_id": payload.get('speaker_id')
                        }
                    }
                }
            )
