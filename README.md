# Avatario JS SDK

The Avatario JS SDK allows you to easily integrate real-time AI video avatars into your web applications. This SDK provides a simple interface to connect to Avatario's video avatar service.

## Installation

```bash
# Install Avatario JS SDK
npm install @avatario/avatario-js-sdk
# or
yarn add @avatario/avatario-js-sdk
```

## Quick Start

```typescript
import { AvatarioClient } from '@avatario/avatario-js-sdk';

// Initialize the SDK with your API key and avatar ID
const client = new AvatarioClient({
  apiKey: 'your-api-key-here', // Required: Your Avatario API key
  avatarId: 'your-avatar-id', // Required: Avatar ID to use
  onConnected: () => console.log('Connected to Avatario room'),
  onDisconnected: () => console.log('Disconnected from Avatario room'),
  onError: (error) => console.error('Error:', error)
});

// Get video and audio elements from your HTML
const videoElement = document.getElementById('video') as HTMLVideoElement;
const audioElement = document.getElementById('audio') as HTMLAudioElement;

// Connect to Avatario
try {
  const { avatarioRoomName } = await client.connect(videoElement, audioElement);
  console.log('Connected to room:', avatarioRoomName);
} catch (error) {
  console.error('Failed to connect:', error);
}

// Disconnect when done
await client.disconnect();
```

## API Reference

### AvatarioClient

#### Constructor

```typescript
new AvatarioClient(options: AvatarioClientOptions)
```

##### Options

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| apiKey | string | Yes | Your Avatario API key |
| avatarId | string | Yes | ID of the avatar to use for video generation |
| onConnected | () => void | No | Callback when connected to the room |
| onDisconnected | () => void | No | Callback when disconnected from the room |
| onError | (error: Error) => void | No | Callback for error handling |

#### Methods

##### connect

```typescript
async connect(
  videoElement?: HTMLVideoElement,
  audioElement?: HTMLAudioElement
): Promise<{ avatarioRoomName: string }>
```

Connects to an Avatario room and sets up video/audio streaming.

Parameters:
- `videoElement`: Optional HTML video element to display the avatar
- `audioElement`: Optional HTML audio element to play the avatar's audio

Returns:
- `avatarioRoomName`: The name of the room that was created

##### disconnect

```typescript
async disconnect(): Promise<void>
```

Disconnects from the current Avatario room.

##### isConnectedToRoom

```typescript
isConnectedToRoom(): boolean
```

Returns whether the SDK is currently connected to a room.

##### getAvatarId

```typescript
getAvatarId(): string
```

Returns the avatar ID that was specified during initialization.

## Available Avatars

The SDK requires a valid avatar ID to function. You can use any of the following stock avatars:

| Avatar ID | Name | Ethnicity | Gender |
|-----------|------|-----------|--------|
| 27a57eb6-c517-4006-98f2-d9357b82ff87 | Ching | Asian | Male |
| b523e8ef-b85b-4e77-9a61-9f8ffb687658 | Sara | Caucasian | Female |
| 347c0c95-ec73-467d-8a07-f73a084441a0 | Jack | African | Male |
| 6d47156b-0cff-4ec5-8628-a0fc9e1e2899 | Amelia | Caucasian | Female |
| eaa7840e-c092-40df-844b-d5df5cef1123 | Sam | Caucasian | Male |
| d1fbd6bc-d848-4e26-918e-4c05ae513190 | Sandra | Caucasian | Female |

## Advanced Integration: Using Avatario with LiveKit

Avatario can be integrated with LiveKit for enhanced real-time communication capabilities. This section explains how to combine the power of Avatario's AI avatars with LiveKit's real-time audio and video communication.

### Installing LiveKit

```bash
# Install LiveKit client alongside Avatario
npm install livekit-client
# or
yarn add livekit-client
```

### Basic LiveKit Setup

Here's how to set up a basic LiveKit room connection for use with Avatario:

```typescript
import { Room, RoomEvent, ConnectionState, Track } from "livekit-client";

// Create a new Room instance
const room = new Room({
  adaptiveStream: true,
  dynacast: true,
});

// Connect to the room (requires a token from your backend)
await room.connect(livekitUrl, token);

// Enable camera and microphone
await room.localParticipant.enableCameraAndMicrophone();

// Listen for connection state changes
room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
  if (state === ConnectionState.Connected) {
    console.log("Connected to LiveKit room");
  } else if (state === ConnectionState.Disconnected) {
    console.log("Disconnected from LiveKit room");
  }
});

// Disconnect when finished
room.disconnect();
```

### Integrating LiveKit with Avatario SDK

When using LiveKit with the Avatario SDK, you typically want to:

1. Connect to an Avatario room for AI avatar rendering
2. Connect to a LiveKit room for real-time communication
3. Send your audio/video to the LiveKit room while receiving avatar video from Avatario

Here's how to implement this pattern:

```typescript
import { Room, RoomEvent, ConnectionState, Track } from "livekit-client";
import { AvatarioClient } from "@avatario/avatario-js-sdk";

// References
const userRoom = useRef<Room | null>(null);
const avatarioSDK = useRef<AvatarioClient | null>(null);

// Video/audio elements
const localVideoRef = useRef<HTMLVideoElement>(null);
const remoteVideoRef = useRef<HTMLVideoElement>(null);
const remoteAudioRef = useRef<HTMLAudioElement>(null);

// Initialize Avatario SDK
avatarioSDK.current = new AvatarioClient({
  apiKey: "your-api-key",
  avatarId: "selected-avatar-id",
  onConnected: () => console.log("Avatario SDK connected"),
  onDisconnected: () => console.log("Avatario SDK disconnected"),
  onError: (error) => console.error("Avatario SDK error:", error),
});

// Connect to Avatario
const connectToAvatario = async () => {
  // Connect to Avatario room and get the room name
  const { avatarioRoomName } = await avatarioSDK.current.connect(
    remoteVideoRef.current!,
    remoteAudioRef.current!
  );
  
  return avatarioRoomName;
};

// Connect to LiveKit
const connectToLiveKit = async (token: string, url: string) => {
  // Create room
  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
  });
  
  // Set up event listener for connection state
  room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
    console.log("LiveKit room connection state:", state);
  });
  
  // Connect to LiveKit room
  await room.connect(url, token);
  
  // Enable camera and microphone
  await room.localParticipant.enableCameraAndMicrophone();
  
  // Attach local video to an element
  if (localVideoRef.current) {
    const videoTracks = room.localParticipant
      .getTrackPublications()
      .filter((publication) => publication.kind === Track.Kind.Video);
      
    if (videoTracks.length > 0 && videoTracks[0].track) {
      videoTracks[0].track.attach(localVideoRef.current);
    }
  }
  
  // Store room reference
  userRoom.current = room;
  
  return room;
};

// Main connect function
const handleConnect = async () => {
  try {
    // 1. Connect to Avatario
    const avatarioRoomName = await connectToAvatario();
    
    // 2. Get LiveKit token (this would be a call to your backend)
    const { token, url } = await getUserToken(avatarioRoomName);
    
    // 3. Connect to LiveKit room
    await connectToLiveKit(token, url);
    
    console.log("Successfully connected to both services");
  } catch (error) {
    console.error("Connection error:", error);
  }
};

// Disconnect from both services
const disconnect = () => {
  if (userRoom.current) {
    userRoom.current.disconnect();
    userRoom.current = null;
  }
  
  if (avatarioSDK.current?.isConnectedToRoom()) {
    avatarioSDK.current.disconnect();
  }
};
```

### Getting LiveKit Tokens

LiveKit requires authentication tokens to join rooms. Here's a simple example of how to fetch a token from your backend:

```typescript
// Function to get user token from backend
const getUserToken = async (avatarioRoomName: string) => {
  try {
    const response = await fetch("https://your-api.example.com/get-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "your-api-key",
      },
      body: JSON.stringify({
        local_identity: "avatario-client",
        user_room_name: "your-room-name",
        avatario_room_name: avatarioRoomName,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.data; // { token: "...", url: "..." }
    }
    throw new Error("Failed to get token");
  } catch (error) {
    console.error("Failed to get token:", error);
    return null;
  }
};
```

### Toggle Audio and Video with LiveKit

Control local audio and video tracks in your LiveKit integration:

```typescript
// Toggle microphone
const toggleAudio = async () => {
  if (!userRoom.current) return;
  await userRoom.current.localParticipant.setMicrophoneEnabled(!audioEnabled);
  setAudioEnabled(!audioEnabled);
};

// Toggle camera
const toggleVideo = async () => {
  if (!userRoom.current) return;
  await userRoom.current.localParticipant.setCameraEnabled(!videoEnabled);
  setVideoEnabled(!videoEnabled);
};
```

### React Integration Example

When using Avatario with LiveKit in a React application, you can use hooks for better state management:

```tsx
import React, { useState, useEffect, useRef } from "react";
import { Room, RoomEvent, ConnectionState } from "livekit-client";
import { AvatarioClient } from "@avatario/avatario-js-sdk";

function VideoChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  
  const roomRef = useRef<Room | null>(null);
  const avatarioRef = useRef<AvatarioClient | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  
  // Initialize Avatario SDK
  useEffect(() => {
    avatarioRef.current = new AvatarioClient({
      apiKey: "your-api-key",
      avatarId: "selected-avatar-id",
      onConnected: () => setIsConnected(true),
      onDisconnected: () => setIsConnected(false),
      onError: (error) => console.error(error),
    });
    
    return () => {
      if (avatarioRef.current?.isConnectedToRoom()) {
        avatarioRef.current.disconnect();
      }
    };
  }, []);
  
  // Connect to both services
  const handleConnect = async () => {
    try {
      // Steps as described earlier
      // 1. Connect to Avatario
      // 2. Get token
      // 3. Connect to LiveKit
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div>
      <div className="video-container">
        <video ref={remoteVideoRef} autoPlay playsInline />
        <audio ref={remoteAudioRef} autoPlay playsInline />
        
        <div className="local-video">
          <video ref={localVideoRef} autoPlay playsInline muted />
        </div>
      </div>
      
      <div className="controls">
        <button onClick={toggleAudio}>
          {audioEnabled ? "Mute" : "Unmute"}
        </button>
        <button onClick={toggleVideo}>
          {videoEnabled ? "Hide Camera" : "Show Camera"}
        </button>
        <button onClick={isConnected ? disconnect : handleConnect}>
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );
}
```

## Troubleshooting

### Autoplay Policy Restrictions

Browser autoplay policies may block audio playback without user interaction. Use this pattern to handle it:

```typescript
useEffect(() => {
  if (isConnected) {
    const unlockAudio = () => {
      if (remoteAudioRef.current) {
        // Create and play a silent audio context
        const AudioContextClass = window.AudioContext || 
          (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const emptySource = audioContext.createBufferSource();
        emptySource.start();
        emptySource.stop();
        
        // Try to play the audio element
        remoteAudioRef.current
          .play()
          .catch(e => console.log("Audio playback still restricted:", e));
      }
      
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
    
    document.addEventListener("click", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);
    
    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
  }
}, [isConnected]);
```

### Device Permissions

Ensure you properly handle device permissions for camera and microphone:

```typescript
// Check if user has granted permissions
const checkPermissions = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    return true;
  } catch (error) {
    console.error("Permission denied:", error);
    return false;
  }
};
```

## Error Handling

The Avatario SDK provides error handling through the `onError` callback in the options. Common errors include:

- Invalid API key
- Invalid avatar ID
- Network connectivity issues
- Room connection failures
- Media device access issues

## Requirements

- Modern browser with WebRTC support
- Valid Avatario API key
- Valid avatar ID
- Internet connection

## Browser Support

The SDK works in all modern browsers that support WebRTC, including:
- Chrome
- Firefox
- Safari
- Edge

## Resources

- [Avatario JS SDK Documentation](https://app.onezot.work/docs)
- [LiveKit Documentation](https://docs.livekit.io)
- [WebRTC Standards](https://webrtc.org/) 