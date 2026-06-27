import { useMediaStore } from '../../store/media';

export class MediaPermissionService {
    public static async checkPermissions(): Promise<boolean> {
        try {
            // First try generic query if supported
            if (navigator.permissions && navigator.permissions.query) {
                const cameraResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
                const micResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                
                if (cameraResult.state === 'denied' || micResult.state === 'denied') {
                    return false;
                }
            }
            return true;
        } catch {
            // Fallback for browsers that don't support permissions.query
            return true;
        }
    }

    public static async requestPermissions(): Promise<MediaStream | null> {
        try {
            useMediaStore.getState().setCameraState('PENDING');
            useMediaStore.getState().setMicrophoneState('PENDING');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            return stream;
        } catch (error) {
            console.error('Error requesting media permissions:', error);
            useMediaStore.getState().setCameraState('UNAUTHORIZED');
            useMediaStore.getState().setMicrophoneState('UNAUTHORIZED');
            return null;
        }
    }
}
