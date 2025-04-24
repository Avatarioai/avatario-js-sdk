interface OneZotSDKOptions {
    apiKey: string;
    avatarId: string;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onError?: (error: Error) => void;
}
declare class OneZotSDK {
    private onezotRoom;
    private options;
    private isConnected;
    private runpodInvoked;
    constructor(options: OneZotSDKOptions);
    private generateUUID;
    private getHeaders;
    private getOnezotToken;
    private invokeRunPod;
    connect(videoElement?: HTMLVideoElement | undefined, audioElement?: HTMLAudioElement | undefined): Promise<{
        onezotRoomName: string;
    }>;
    disconnect(): Promise<void>;
    isConnectedToRoom(): boolean;
    getAvatarId(): string;
}

export { OneZotSDK, type OneZotSDKOptions };
