interface AvatarioClientOptions {
    apiKey: string;
    avatarId: string;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onError?: (error: Error) => void;
}
declare class AvatarioClient {
    private avatarioRoom;
    private options;
    private isConnected;
    private runpodInvoked;
    constructor(options: AvatarioClientOptions);
    private generateUUID;
    private getHeaders;
    private getAvatarioToken;
    private invokeRunPod;
    connect(videoElement?: HTMLVideoElement | undefined, audioElement?: HTMLAudioElement | undefined): Promise<{
        avatarioRoomName: string;
    }>;
    disconnect(): Promise<void>;
    isConnectedToRoom(): boolean;
    getAvatarId(): string;
}

export { AvatarioClient, type AvatarioClientOptions };
