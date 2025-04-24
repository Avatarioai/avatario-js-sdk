import { Room, RoomEvent } from "livekit-client";

const BASE_URL = "https://app.avatario.work/api/sdk";
//   "https://uu4rvj3echoqgzz7lxmbnukkmy0yblql.lambda-url.us-east-1.on.aws";

const LOCAL_IDENTITY = "avatario-client";

export interface AvatarioClientOptions {
  apiKey: string;
  avatarId: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

export class AvatarioClient {
  private avatarioRoom: Room | null = null;
  private options: AvatarioClientOptions;
  private isConnected = false;
  private runpodInvoked = false;

  constructor(options: AvatarioClientOptions) {
    if (!options.apiKey) {
      throw new Error("API key is required");
    }
    if (!options.avatarId) {
      throw new Error("Avatar ID is required");
    }
    this.options = options;
  }

  private generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.options.apiKey,
      "ngrok-skip-browser-warning": "69420",
    };
  }

  private async getAvatarioToken(avatarioRoomName: string) {
    try {
      const response = await fetch(`${BASE_URL}/get-token-avatario`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          local_identity: LOCAL_IDENTITY,
          room_name: avatarioRoomName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get Avatario token");
      }

      return await response.json();
    } catch (error) {
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  private async invokeRunPod(avatarioRoomName: string) {
    try {
      const response = await fetch(`${BASE_URL}/invoke-runpod`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          local_identity: LOCAL_IDENTITY,
          room_name: avatarioRoomName,
          audio_sample_rate: 24000,
          video_frame_width: 1920,
          video_frame_height: 1080,
          avatario_face_id: this.options.avatarId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to invoke RunPod");
      }

      this.runpodInvoked = true;
      return true;
    } catch (error) {
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  async connect(
    videoElement?: HTMLVideoElement | undefined,
    audioElement?: HTMLAudioElement | undefined
  ): Promise<{ avatarioRoomName: string }> {
    try {
      const avatarioRoomName = `avatario-${this.generateUUID()}`;
      const avatarioTokenResponse = await this.getAvatarioToken(avatarioRoomName);

      // Initialize Avatario room
      const avatarioRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      // Set up event listeners for Avatario room
      avatarioRoom
        .on(RoomEvent.Connected, () => {
          console.log("Connected to Avatario room");
          if (!this.runpodInvoked) {
            this.invokeRunPod(avatarioRoomName).catch(console.error);
          }
        })
        .on(RoomEvent.Disconnected, () => {
          console.log("Disconnected from Avatario room");
        })
        .on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
          console.log(
            "Track subscribed:",
            track.kind,
            "from participant:",
            participant.identity
          );

          if (track.kind === "video" && videoElement) {
            track.attach(videoElement);
          }

          if (track.kind === "audio" && audioElement) {
            track.attach(audioElement);
          }
        });

      // Connect to Avatario room
      await avatarioRoom.connect(
        avatarioTokenResponse.url,
        avatarioTokenResponse.token
      );

      this.avatarioRoom = avatarioRoom;
      this.isConnected = true;
      this.options.onConnected?.();

      return {
        avatarioRoomName,
      };
    } catch (error) {
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  async disconnect() {
    if (this.avatarioRoom) {
      await this.avatarioRoom.disconnect();
      this.avatarioRoom = null;
    }

    this.isConnected = false;
    this.runpodInvoked = false;
    this.options.onDisconnected?.();
  }

  isConnectedToRoom(): boolean {
    return this.isConnected;
  }

  getAvatarId(): string {
    return this.options.avatarId;
  }
}
