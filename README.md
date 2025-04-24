# Avatario JS SDK

The Avatario JS SDK allows you to easily integrate real-time AI video avatars into your web applications. This SDK provides a simple interface to connect to Avatario's video avatar service.

## Installation

```bash
npm install avatario-js-sdk
# or
yarn add avatario-js-sdk
```

## Quick Start

```typescript
import { AvatarioClient } from 'avatario-js-sdk';

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

## Example Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>Avatario Demo</title>
</head>
<body>
  <video id="video" autoplay playsinline></video>
  <audio id="audio" autoplay></audio>

  <script type="module">
    import { AvatarioClient } from 'avatario-js-sdk';

    const client = new AvatarioClient({
      apiKey: 'your-api-key-here',
      avatarId: '27a57eb6-c517-4006-98f2-d9357b82ff87',
      onConnected: () => console.log('Connected!'),
      onDisconnected: () => console.log('Disconnected!'),
      onError: (error) => console.error('Error:', error)
    });

    const videoElement = document.getElementById('video');
    const audioElement = document.getElementById('audio');

    // Connect when a button is clicked
    document.getElementById('connect').addEventListener('click', async () => {
      try {
        const { avatarioRoomName } = await client.connect(videoElement, audioElement);
        console.log('Connected to room:', avatarioRoomName);
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    });

    // Disconnect when another button is clicked
    document.getElementById('disconnect').addEventListener('click', async () => {
      await client.disconnect();
    });
  </script>

  <button id="connect">Connect</button>
  <button id="disconnect">Disconnect</button>
</body>
</html>
```

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

## Error Handling

The SDK provides error handling through the `onError` callback in the options. Common errors include:

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

## License

MIT 