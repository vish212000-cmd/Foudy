import { useGroupStore } from '../../store/group';

export class ParticipantMediaManager {
    /**
     * Abstracted away for future SFU swap.
     * Currently manages mute states via GroupEventDispatcher payloads.
     */
    
    public setLocalAudioEnabled(_enabled: boolean) {
        // Find local tracks from MediaService and toggle
        // Then broadcast state to others
    }

    public setLocalVideoEnabled(_enabled: boolean) {
        // Find local tracks from MediaService and toggle
        // Then broadcast state to others
    }

    public handleRemoteMediaStateChange(userId: number, audio: boolean, video: boolean) {
        useGroupStore.getState().updateParticipant(userId, {
            isMuted: !audio,
            isCameraOff: !video
        });
    }
}
