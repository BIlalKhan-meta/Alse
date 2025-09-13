import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CallState {
  isInCall: boolean;
  callType: 'video' | 'audio' | null;
  channel: string | null;
  uid: number | null;
  receiverName: string | null;
  receiverAvatar: string | null;
  callDuration: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  incomingCall: {
    isActive: boolean;
    callerName: string | null;
    callerAvatar: string | null;
    channel: string | null;
    uid: number | null;
    callType: 'video' | 'audio' | null;
  };
}

const initialState: CallState = {
  isInCall: false,
  callType: null,
  channel: null,
  uid: null,
  receiverName: null,
  receiverAvatar: null,
  callDuration: 0,
  isMuted: false,
  isVideoEnabled: true,
  incomingCall: {
    isActive: false,
    callerName: null,
    callerAvatar: null,
    channel: null,
    uid: null,
    callType: null,
  },
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    startCall: (
      state,
      action: PayloadAction<{
        callType: 'video' | 'audio';
        channel: string;
        uid: number;
        receiverName: string;
        receiverAvatar?: string;
      }>,
    ) => {
      state.isInCall = true;
      state.callType = action.payload.callType;
      state.channel = action.payload.channel;
      state.uid = action.payload.uid;
      state.receiverName = action.payload.receiverName;
      state.receiverAvatar = action.payload.receiverAvatar || null;
      state.callDuration = 0;
      state.isMuted = false;
      state.isVideoEnabled = action.payload.callType === 'video';
    },
    endCall: state => {
      state.isInCall = false;
      state.callType = null;
      state.channel = null;
      state.uid = null;
      state.receiverName = null;
      state.receiverAvatar = null;
      state.callDuration = 0;
      state.isMuted = false;
      state.isVideoEnabled = true;
    },
    updateCallDuration: (state, action: PayloadAction<number>) => {
      state.callDuration = action.payload;
    },
    toggleMute: state => {
      state.isMuted = !state.isMuted;
    },
    toggleVideo: state => {
      state.isVideoEnabled = !state.isVideoEnabled;
    },
    setIncomingCall: (
      state,
      action: PayloadAction<{
        callerName: string;
        callerAvatar?: string;
        channel: string;
        uid: number;
        callType: 'video' | 'audio';
      }>,
    ) => {
      state.incomingCall = {
        isActive: true,
        callerName: action.payload.callerName,
        callerAvatar: action.payload.callerAvatar || null,
        channel: action.payload.channel,
        uid: action.payload.uid,
        callType: action.payload.callType,
      };
    },
    clearIncomingCall: state => {
      state.incomingCall = {
        isActive: false,
        callerName: null,
        callerAvatar: null,
        channel: null,
        uid: null,
        callType: null,
      };
    },
    answerCall: state => {
      if (state.incomingCall.isActive) {
        state.isInCall = true;
        state.callType = state.incomingCall.callType;
        state.channel = state.incomingCall.channel;
        state.uid = state.incomingCall.uid;
        state.receiverName = state.incomingCall.callerName;
        state.receiverAvatar = state.incomingCall.callerAvatar;
        state.callDuration = 0;
        state.isMuted = false;
        state.isVideoEnabled = state.incomingCall.callType === 'video';
        state.incomingCall.isActive = false;
      }
    },
    declineCall: state => {
      state.incomingCall.isActive = false;
      state.incomingCall.callerName = null;
      state.incomingCall.callerAvatar = null;
      state.incomingCall.channel = null;
      state.incomingCall.uid = null;
      state.incomingCall.callType = null;
    },
  },
});

export const {
  startCall,
  endCall,
  updateCallDuration,
  toggleMute,
  toggleVideo,
  setIncomingCall,
  clearIncomingCall,
  answerCall,
  declineCall,
} = callSlice.actions;

export default callSlice.reducer;
