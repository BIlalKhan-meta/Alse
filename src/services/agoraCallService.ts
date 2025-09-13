import {createAgoraRtcEngine, IRtcEngine} from 'react-native-agora';
import {Platform, PermissionsAndroid} from 'react-native';

/**
 * Agora Call Service for in-app video/voice calling
 */
class AgoraCallService {
  private engine: IRtcEngine | null = null;
  private appId: string = 'a0c7366a22ac46b791c69f685591207c'; // Same as livestream
  private isInitialized: boolean = false;
  private currentChannel: string | null = null;
  private currentUid: number | null = null;

  /**
   * Initialize Agora RTC Engine
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized && this.engine) {
        return true;
      }

      this.engine = createAgoraRtcEngine();
      await this.engine.initialize({appId: this.appId});

      // Enable video and audio
      this.engine.enableVideo();
      this.engine.enableAudio();

      // Set audio route to speaker for better call experience
      this.engine.setDefaultAudioRouteToSpeakerphone(true);

      this.isInitialized = true;
      console.log('Agora RTC Engine initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Agora RTC Engine:', error);
      return false;
    }
  }

  /**
   * Request necessary permissions for video calling
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);

        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED,
        );

        if (allGranted) {
          console.log('All permissions granted');
          return true;
        } else {
          console.log('Some permissions were denied');
          return false;
        }
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    }
    return true; // iOS permissions are handled automatically
  }

  /**
   * Join a video call channel
   */
  async joinChannel(
    channel: string,
    uid: number,
    token?: string,
    onUserJoined?: (uid: number) => void,
    onUserOffline?: (uid: number) => void,
    onError?: (error: any) => void,
  ): Promise<boolean> {
    try {
      if (!this.engine || !this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return false;
      }

      // Set up event handlers
      this.engine.registerEventHandler({
        onJoinChannelSuccess: (
          channelName: string,
          uid: number,
          _elapsed: number,
        ) => {
          console.log('Successfully joined channel:', channelName, 'uid:', uid);
          this.currentChannel = channelName;
          this.currentUid = uid;
        },
        onUserJoined: (uid: number, _elapsed: number) => {
          console.log('User joined:', uid);
          onUserJoined?.(uid);
        },
        onUserOffline: (uid: number, reason: number) => {
          console.log('User offline:', uid, 'reason:', reason);
          onUserOffline?.(uid);
        },
        onError: (err: number, msg: string) => {
          console.error('Agora error:', err, msg);
          onError?.({err, msg});
        },
        onLeaveChannel: (_stats: any) => {
          console.log('Left channel successfully');
          this.currentChannel = null;
          this.currentUid = null;
        },
      });

      // Join channel
      await this.engine.joinChannel(token || '', channel, uid, {
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });

      return true;
    } catch (error) {
      console.error('Failed to join channel:', error);
      onError?.(error);
      return false;
    }
  }

  /**
   * Leave the current channel
   */
  async leaveChannel(): Promise<boolean> {
    try {
      if (this.engine && this.currentChannel) {
        await this.engine.leaveChannel();
        this.currentChannel = null;
        this.currentUid = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to leave channel:', error);
      return false;
    }
  }

  /**
   * Mute/unmute local audio
   */
  async toggleAudioMute(): Promise<boolean> {
    try {
      if (this.engine) {
        const isMuted = await this.engine.isAudioEnabled();
        await this.engine.muteLocalAudio(!isMuted);
        return !isMuted;
      }
      return false;
    } catch (error) {
      console.error('Failed to toggle audio mute:', error);
      return false;
    }
  }

  /**
   * Enable/disable local video
   */
  async toggleVideoEnabled(): Promise<boolean> {
    try {
      if (this.engine) {
        const isEnabled = await this.engine.isVideoEnabled();
        await this.engine.muteLocalVideo(!isEnabled);
        return !isEnabled;
      }
      return false;
    } catch (error) {
      console.error('Failed to toggle video:', error);
      return false;
    }
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera(): Promise<boolean> {
    try {
      if (this.engine) {
        await this.engine.switchCamera();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to switch camera:', error);
      return false;
    }
  }

  /**
   * Get current channel info
   */
  getCurrentChannel(): {channel: string | null; uid: number | null} {
    return {
      channel: this.currentChannel,
      uid: this.currentUid,
    };
  }

  /**
   * Check if currently in a call
   */
  isInCall(): boolean {
    return this.currentChannel !== null;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.engine) {
        await this.leaveChannel();
        await this.engine.release();
        this.engine = null;
        this.isInitialized = false;
        this.currentChannel = null;
        this.currentUid = null;
      }
    } catch (error) {
      console.error('Failed to cleanup Agora engine:', error);
    }
  }
}

// Export singleton instance
export const agoraCallService = new AgoraCallService();
export default agoraCallService;
