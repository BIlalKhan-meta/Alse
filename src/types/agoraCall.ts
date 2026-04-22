/** Navigation params for Agora 1:1 calls (LetsPlanADate-style). */
export type AgoraCallRouteParams = {
  chatId: string;
  callId?: string;
  userName: string;
  otherUserId?: string;
  /** Callee joined from incoming overlay */
  isReceiver?: boolean;
  isVideo: boolean;
};

/** @deprecated Use AgoraCallRouteParams — kept for gradual migration */
export type HmsCallRouteParams = AgoraCallRouteParams;
