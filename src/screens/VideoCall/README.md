# In-App Video Calling Feature

This implementation provides a complete in-app video and voice calling solution using Agora SDK, integrated seamlessly with the existing chat functionality.

## Features

- **Video Calls**: High-quality video calling with camera switching
- **Voice Calls**: Audio-only calling option
- **Real-time Communication**: Low-latency communication using Agora RTC
- **Call Management**: Incoming/outgoing call handling
- **Notifications**: Push notifications for incoming calls
- **State Management**: Redux-based call state management
- **Permissions**: Automatic camera and microphone permission handling

## Architecture

### Core Components

1. **AgoraCallService** (`src/services/agoraCallService.ts`)

   - Singleton service for Agora RTC operations
   - Handles initialization, channel joining, and cleanup
   - Manages audio/video controls

2. **Call State Management** (`src/store/slices/callSlice.ts`)

   - Redux slice for call state
   - Actions for call lifecycle management
   - Incoming call state handling

3. **Call Manager Hook** (`src/hooks/useCallManager.ts`)

   - Custom hook for call operations
   - Integrates Agora service with Redux state
   - Handles notifications and app state changes

4. **Call Screens**
   - `VideoCall`: Main call interface with controls
   - `IncomingVideoCall`: Incoming call screen
   - Integrated into `ChatOngoing` screen

### API Integration

- **Token Generation**: Uses existing `/get-signature` endpoint
- **Call Session Management**: New endpoints for call tracking
- **Backend Integration**: Seamless integration with existing auth system

## Usage

### Starting a Call

```typescript
import {useCallManager} from '../hooks/useCallManager';

const {initiateCall} = useCallManager();

// Start a video call
await initiateCall(
  'video',
  'call_channel_123',
  userId,
  'John Doe',
  'https://example.com/avatar.jpg',
);
```

### Handling Incoming Calls

```typescript
const {handleIncomingCall, answerIncomingCall, declineIncomingCall} =
  useCallManager();

// Show incoming call
handleIncomingCall(
  'Jane Doe',
  'video',
  'call_channel_456',
  callerId,
  'https://example.com/avatar.jpg',
);

// Answer call
await answerIncomingCall();

// Decline call
declineIncomingCall();
```

### Call Controls

```typescript
const {toggleCallMute, toggleCallVideo, switchCamera} = useCallManager();

// Toggle mute
await toggleCallMute();

// Toggle video
await toggleCallVideo();

// Switch camera
await switchCamera();
```

## Integration with Chat

The calling feature is integrated into the existing chat system:

1. **Call Options**: Phone button in chat header shows call options
2. **Call Types**: Video call, voice call, and phone call options
3. **User Context**: Automatically uses chat user information
4. **Seamless Navigation**: Smooth transition between chat and calls

## Permissions

The system automatically handles permissions:

- **Android**: Requests CAMERA, RECORD_AUDIO, and READ_PHONE_STATE
- **iOS**: Permissions are handled automatically
- **Graceful Fallback**: Shows appropriate error messages if permissions denied

## Notifications

- **Incoming Calls**: Push notifications with answer/decline options
- **Missed Calls**: Notifications for declined calls
- **Call Ended**: Notifications showing call duration

## Configuration

### Agora App ID

The Agora App ID is configured in `src/services/agoraCallService.ts`:

```typescript
private appId: string = 'a0c7366a22ac46b791c69f685591207c';
```

### API Endpoints

Call-related endpoints are defined in `src/api/calling.ts` and use the existing signature endpoint for token generation.

## Error Handling

- **Permission Errors**: Clear error messages for permission issues
- **Network Errors**: Retry mechanisms for connection failures
- **Agora Errors**: Comprehensive error handling for RTC operations
- **Graceful Degradation**: Fallback options when features fail

## Testing

To test the calling feature:

1. **Start a call** from the chat screen
2. **Answer incoming calls** when notifications appear
3. **Test controls** (mute, video toggle, camera switch)
4. **Test permissions** by denying camera/microphone access
5. **Test network conditions** with poor connectivity

## Future Enhancements

- **Group Calls**: Multi-participant video calls
- **Screen Sharing**: Share screen during calls
- **Call Recording**: Record calls for later review
- **Call History**: Detailed call logs and statistics
- **Advanced Controls**: More granular audio/video settings

## Dependencies

- `react-native-agora`: ^4.5.1
- `react-native-push-notification`: ^8.1.1
- `@reduxjs/toolkit`: ^2.2.7
- `react-redux`: ^9.1.2

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check device settings and restart app
2. **Token Issues**: Verify API endpoint and authentication
3. **Connection Failed**: Check network connectivity and Agora configuration
4. **Audio/Video Issues**: Ensure proper device permissions and hardware

### Debug Mode

Enable debug logging by setting console log levels in the Agora service for detailed troubleshooting information.
