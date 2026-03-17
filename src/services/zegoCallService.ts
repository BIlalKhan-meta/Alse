import * as ZIM from 'zego-zim-react-native';
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import {StackActions} from '@react-navigation/native';
import {ZEGO_APP_ID, ZEGO_APP_SIGN} from '../config/zego';
import {navigationRef} from '../utils/navigationRef';

/**
 * When call ends, pop back past ZegoUIKitPrebuiltCallWaitingScreen (caller flow)
 * so we don't show the unwanted "waiting" screen with decline/hangup button.
 */
function navigateBackAfterCallEnd() {
  if (!navigationRef.isReady()) return;
  try {
    const state = navigationRef.getState();
    const appNav = state?.routes?.find((r: any) => r.name === 'AppNavigation');
    const appState = appNav?.state as {routes?: {name: string}[]; index?: number} | undefined;
    const routes = appState?.routes ?? [];
    const currentIndex = appState?.index ?? routes.length - 1;
    const prevRoute = routes[currentIndex - 1];
    if (prevRoute?.name === 'ZegoUIKitPrebuiltCallWaitingScreen') {
      navigationRef.dispatch(StackActions.pop(2));
    } else {
      navigationRef.goBack();
    }
  } catch {
    navigationRef.goBack();
  }
}

/**
 * ZEGOCLOUD Call Service - wraps init/uninit for call invitation flow.
 * Initialize on user login, uninit on logout.
 */
class ZegoCallService {
  private isInitialized = false;

  async init(userId: string | number, userName: string): Promise<boolean> {
    const userID = String(userId);
    const displayName = userName || `user_${userID}`;

    if (this.isInitialized) {
      console.log('[ZegoCallService] Already initialized');
      return true;
    }

    try {
      await ZegoUIKitPrebuiltCallService.init(
        ZEGO_APP_ID,
        ZEGO_APP_SIGN,
        userID,
        displayName,
        [ZIM],
        {
          ringtoneConfig: {
            incomingCallFileName: 'zego_incoming.mp3',
            outgoingCallFileName: 'zego_outgoing.mp3',
          },
          requireConfig: (callInvitationData: any) => ({
            onCallEnd: (callID: string, reason: number, duration: number) => {
              console.log('[ZegoCallService] Call ended:', callID, reason, duration);
              navigateBackAfterCallEnd();
            },
          }),
        },
      );
      this.isInitialized = true;
      console.log('[ZegoCallService] Initialized for user:', userID);
      return true;
    } catch (error) {
      console.error('[ZegoCallService] Init failed:', error);
      return false;
    }
  }

  uninit(): void {
    try {
      ZegoUIKitPrebuiltCallService.uninit();
      this.isInitialized = false;
      console.log('[ZegoCallService] Uninitialized');
    } catch (error) {
      console.warn('[ZegoCallService] Uninit error:', error);
    }
  }

  isLoggedIn(): boolean {
    return this.isInitialized;
  }
}

export const zegoCallService = new ZegoCallService();
export default zegoCallService;
