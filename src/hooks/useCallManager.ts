import {useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppState, AppStateStatus} from 'react-native';
import {RootState} from '../store';
import {
  startCall,
  endCall,
  updateCallDuration,
  toggleMute,
  toggleVideo,
  setIncomingCall,
  clearIncomingCall,
  answerCall,
  declineCall,
} from '../store/slices/callSlice';
import agoraCallService from '../services/agoraCallService';
import callNotificationService from '../services/callNotificationService';

/**
 * Custom hook for managing call state and functionality
 */
export const useCallManager = () => {
  const dispatch = useDispatch();
  const callState = useSelector((state: RootState) => state.call);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize notification service
  useEffect(() => {
    callNotificationService.initialize();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && callState.isInCall) {
        // App went to background during call
        console.log('App went to background during call');
      } else if (nextAppState === 'active' && callState.isInCall) {
        // App came to foreground during call
        console.log('App came to foreground during call');
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription?.remove();
  }, [callState.isInCall]);

  // Start call duration timer
  const startCallTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      dispatch(updateCallDuration(callState.callDuration + 1));
    }, 1000);
  }, [dispatch, callState.callDuration]);

  // Stop call duration timer
  const stopCallTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start a new call
  const initiateCall = useCallback(
    async (
      callType: 'video' | 'audio',
      channel: string,
      uid: number,
      receiverName: string,
      receiverAvatar?: string,
    ) => {
      try {
        // Request permissions
        const hasPermissions = await agoraCallService.requestPermissions();
        if (!hasPermissions) {
          throw new Error('Camera and microphone permissions are required');
        }

        // Initialize Agora
        const initialized = await agoraCallService.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize calling service');
        }

        // Dispatch call start
        dispatch(
          startCall({
            callType,
            channel,
            uid,
            receiverName,
            receiverAvatar,
          }),
        );

        // Start call timer
        startCallTimer();

        return true;
      } catch (error) {
        console.error('Failed to initiate call:', error);
        dispatch(endCall());
        throw error;
      }
    },
    [dispatch, startCallTimer],
  );

  // End current call
  const endCurrentCall = useCallback(async () => {
    try {
      await agoraCallService.leaveChannel();
      stopCallTimer();
      dispatch(endCall());
      callNotificationService.cancelIncomingCallNotification();
    } catch (error) {
      console.error('Error ending call:', error);
      dispatch(endCall());
    }
  }, [dispatch, stopCallTimer]);

  // Handle incoming call
  const handleIncomingCall = useCallback(
    (
      callerName: string,
      callType: 'video' | 'audio',
      channel: string,
      uid: number,
      callerAvatar?: string,
    ) => {
      dispatch(
        setIncomingCall({
          callerName,
          callerAvatar,
          channel,
          uid,
          callType,
        }),
      );

      // Show notification
      callNotificationService.showIncomingCallNotification(
        callerName,
        callType,
        channel,
        uid,
      );
    },
    [dispatch],
  );

  // Answer incoming call
  const answerIncomingCall = useCallback(async () => {
    try {
      const {incomingCall} = callState;
      if (!incomingCall.isActive) return;

      // Initialize Agora
      const initialized = await agoraCallService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize calling service');
      }

      // Answer the call
      dispatch(answerCall());

      // Start call timer
      startCallTimer();

      // Cancel notification
      callNotificationService.cancelIncomingCallNotification();
    } catch (error) {
      console.error('Failed to answer call:', error);
      dispatch(declineCall());
    }
  }, [callState, dispatch, startCallTimer]);

  // Decline incoming call
  const declineIncomingCall = useCallback(() => {
    dispatch(declineCall());
    callNotificationService.cancelIncomingCallNotification();
    callNotificationService.showMissedCallNotification(
      callState.incomingCall.callerName || 'Unknown',
    );
  }, [dispatch, callState.incomingCall.callerName]);

  // Toggle mute
  const toggleCallMute = useCallback(async () => {
    try {
      const newMuteState = await agoraCallService.toggleAudioMute();
      dispatch(toggleMute());
      return newMuteState;
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      return false;
    }
  }, [dispatch]);

  // Toggle video
  const toggleCallVideo = useCallback(async () => {
    try {
      const newVideoState = await agoraCallService.toggleVideoEnabled();
      dispatch(toggleVideo());
      return !newVideoState;
    } catch (error) {
      console.error('Failed to toggle video:', error);
      return false;
    }
  }, [dispatch]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    try {
      return await agoraCallService.switchCamera();
    } catch (error) {
      console.error('Failed to switch camera:', error);
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCallTimer();
      if (callState.isInCall) {
        agoraCallService.leaveChannel();
      }
    };
  }, [callState.isInCall, stopCallTimer]);

  return {
    callState,
    initiateCall,
    endCurrentCall,
    handleIncomingCall,
    answerIncomingCall,
    declineIncomingCall,
    toggleCallMute,
    toggleCallVideo,
    switchCamera,
  };
};

export default useCallManager;
