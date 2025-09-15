# ALSE Video Calling Implementation

This document provides comprehensive information about the video calling implementation in the ALSE app, which integrates with Agora's video calling APIs.

## Overview

The calling system consists of several key components:

1. **API Layer** (`src/api/calling.ts`) - Handles all Agora API interactions
2. **Services** - Manage call flow and notifications
3. **Screens** - UI components for different call states
4. **Agora Integration** - Real-time video/audio communication

## Architecture

### API Integration

The calling system uses the provided Agora backend APIs:

- **Start Live Stream**: Creates a new call session
- **Get Agora Token**: Retrieves authentication tokens
- **End Live Stream**: Terminates call sessions
- **Get Channel Users**: Lists participants in a call

### Key Components

#### 1. Call Manager Service (`src/services/callManagerService.ts`)

Central service that manages the complete call flow:

```typescript
// Initiate a call
const result = await callManagerService.initiateCall(
  receiverId,
  receiverName,
  callType,
  receiverAvatar,
);

// Join an incoming call
const result = await callManagerService.joinCall(
  channel,
  callerName,
  callType,
  callerAvatar,
  sessionId,
);

// End current call
const result = await callManagerService.endCall();
```

#### 2. Agora Call Service (`src/services/agoraCallService.ts`)

Handles Agora RTC engine operations:

- Initialize Agora engine
- Join/leave channels
- Toggle audio/video
- Switch camera
- Manage permissions

#### 3. Call Notification Service (`src/services/callNotificationService.ts`)

Manages call-related notifications:

- Incoming call notifications
- Missed call notifications
- Call ended notifications

### Screens

#### 1. ChatOngoing Screen (`src/screens/ChatOngoing/index.tsx`)

Main chat interface with calling options:

- **Video Call**: Initiates video calls
- **Voice Call**: Initiates audio-only calls
- **Phone Call**: Makes traditional phone calls

#### 2. VideoCall Screen (`src/screens/VideoCall/index.tsx`)

Active call interface with:

- Remote video display
- Local video preview
- Call controls (mute, video toggle, camera switch, end call)
- Call duration timer
- User information display

#### 3. IncomingVideoCall Screen (`src/screens/IncomingVideoCall/index.tsx`)

Incoming call interface with:

- Caller information display
- Accept/decline options
- Call type indication (video/audio)
- Auto-decline after timeout

## API Endpoints Used

### Live Stream APIs

```bash
# Start a live stream (create call session)
POST /api/live-stream/start

# Get Agora token for audience
GET /api/live-stream/getToken/{channelName}

# End live stream
GET /api/live-stream/end

# Get users in channel
GET /api/live-stream/users/{channelName}
```

### Chat APIs

```bash
# Get Agora signature for calling
GET /api/get-signature?session_name={channel}&chat_id={uid}&role={role}
```

## Call Flow

### 1. Outgoing Call

1. User taps call button in chat
2. `makeVideoCall()` is called
3. `callManagerService.initiateCall()` creates call session
4. API call to `/api/live-stream/start`
5. Navigate to VideoCall screen with Agora token
6. Agora engine joins channel
7. Call is active

### 2. Incoming Call

1. Incoming call notification received
2. Navigate to IncomingVideoCall screen
3. User can accept or decline
4. If accepted: join call as audience
5. If declined: show missed call notification

### 3. Call End

1. User taps end call button
2. `callManagerService.endCall()` is called
3. API call to `/api/live-stream/end`
4. Agora engine leaves channel
5. Navigate back to chat
6. Show call duration notification

## Configuration

### Agora App ID

The Agora App ID is configured in `src/services/agoraCallService.ts`:

```typescript
private appId: string = 'a0c7366a22ac46b791c69f685591207c';
```

### Permissions

Required permissions for Android:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.CALL_PHONE" />
```

## Error Handling

The system includes comprehensive error handling:

1. **Permission Errors**: Graceful fallback when permissions are denied
2. **Network Errors**: Retry mechanisms and user feedback
3. **Agora Errors**: Proper error messages and fallback options
4. **API Errors**: Detailed error messages from backend

## Testing

### Manual Testing

1. **Outgoing Calls**:

   - Tap video call button in chat
   - Verify call session creation
   - Check Agora token retrieval
   - Test call controls

2. **Incoming Calls**:

   - Simulate incoming call
   - Test accept/decline functionality
   - Verify call joining

3. **Call Features**:
   - Mute/unmute audio
   - Enable/disable video
   - Switch camera
   - End call

### Debug Information

Enable debug logging by checking console output:

```typescript
console.log('Call session created:', callSession);
console.log('Agora token received:', token);
console.log('Channel joined successfully');
```

## Troubleshooting

### Common Issues

1. **Call Not Connecting**:

   - Check Agora App ID
   - Verify network connectivity
   - Check token validity

2. **Permissions Denied**:

   - Request permissions manually
   - Check device settings
   - Handle permission denial gracefully

3. **Audio/Video Issues**:
   - Check device permissions
   - Verify Agora engine initialization
   - Test with different devices

### Debug Steps

1. Check console logs for errors
2. Verify API responses
3. Test with different users
4. Check network connectivity
5. Verify Agora token validity

## Future Enhancements

1. **Group Calls**: Support for multiple participants
2. **Call Recording**: Record and save calls
3. **Screen Sharing**: Share device screen during calls
4. **Call History**: Track and display call logs
5. **Push Notifications**: Real-time incoming call notifications

## Dependencies

- `react-native-agora`: Agora RTC SDK
- `react-native-push-notification`: Call notifications
- `react-native-phone-call`: Traditional phone calls
- `lucide-react-native`: UI icons

## Support

For issues or questions regarding the calling implementation:

1. Check this documentation
2. Review console logs
3. Test with different scenarios
4. Contact development team

---

**Note**: This implementation is designed to work with the provided Agora backend APIs and follows the ALSE app's architecture patterns.
