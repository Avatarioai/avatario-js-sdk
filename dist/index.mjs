var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/AvatarioClient.ts
import { Room, RoomEvent } from "livekit-client";
var BASE_URL = "http://localhost:3000/api/sdk";
var LOCAL_IDENTITY = "avatario-client";
var AvatarioClient = class {
  constructor(options) {
    __publicField(this, "avatarioRoom", null);
    __publicField(this, "options");
    __publicField(this, "isConnected", false);
    __publicField(this, "runpodInvoked", false);
    if (!options.apiKey) {
      throw new Error("API key is required");
    }
    if (!options.avatarId) {
      throw new Error("Avatar ID is required");
    }
    this.options = options;
  }
  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  getHeaders() {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.options.apiKey,
      "ngrok-skip-browser-warning": "69420"
    };
  }
  async getAvatarioToken(avatarioRoomName) {
    try {
      const response = await fetch(`${BASE_URL}/get-token-onezot`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          local_identity: LOCAL_IDENTITY,
          room_name: avatarioRoomName
        })
      });
      if (!response.ok) {
        throw new Error("Failed to get Avatario token");
      }
      return await response.json();
    } catch (error) {
      this.options.onError?.(error);
      throw error;
    }
  }
  async invokeRunPod(avatarioRoomName) {
    try {
      const response = await fetch(`${BASE_URL}/invoke-runpod`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          local_identity: LOCAL_IDENTITY,
          room_name: avatarioRoomName,
          audio_sample_rate: 24e3,
          video_frame_width: 1920,
          video_frame_height: 1080,
          avatario_face_id: this.options.avatarId
        })
      });
      if (!response.ok) {
        throw new Error("Failed to invoke RunPod");
      }
      this.runpodInvoked = true;
      return true;
    } catch (error) {
      this.options.onError?.(error);
      throw error;
    }
  }
  async connect(videoElement, audioElement) {
    try {
      const avatarioRoomName = `avatario-${this.generateUUID()}`;
      const avatarioTokenResponse = await this.getAvatarioToken(avatarioRoomName);
      const avatarioRoom = new Room({
        adaptiveStream: true,
        dynacast: true
      });
      avatarioRoom.on(RoomEvent.Connected, () => {
        console.log("Connected to Avatario room");
        if (!this.runpodInvoked) {
          this.invokeRunPod(avatarioRoomName).catch(console.error);
        }
      }).on(RoomEvent.Disconnected, () => {
        console.log("Disconnected from Avatario room");
      }).on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
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
      await avatarioRoom.connect(
        avatarioTokenResponse.url,
        avatarioTokenResponse.token
      );
      this.avatarioRoom = avatarioRoom;
      this.isConnected = true;
      this.options.onConnected?.();
      return {
        avatarioRoomName
      };
    } catch (error) {
      this.options.onError?.(error);
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
  isConnectedToRoom() {
    return this.isConnected;
  }
  getAvatarId() {
    return this.options.avatarId;
  }
};
export {
  AvatarioClient
};
