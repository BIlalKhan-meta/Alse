import {createNavigationContainerRef} from '@react-navigation/core';

export const navigationRef = createNavigationContainerRef();

export function navigateToIncomingVideoCall(params: {
  callerName: string;
  callerAvatar?: string;
  channel: string;
  uid: number;
  callType?: 'video' | 'audio';
  sessionId?: string;
}) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('AppNavigation' as never, {
      screen: 'IncomingVideoCall',
      params,
    } as never);
  }
}
