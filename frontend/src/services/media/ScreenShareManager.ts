export class ScreenShareManager {
    // Architecture only, not implementing for this phase
    public async startScreenShare(): Promise<MediaStreamTrack | null> {
        throw new Error("Screen sharing not implemented in this phase");
    }

    public stopScreenShare() {
        throw new Error("Screen sharing not implemented in this phase");
    }
}
