/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// Register app first to prevent "has not been registered" error if init fails
AppRegistry.registerComponent(appName, () => App);

// Defer optional init - wrap in try/catch so failures don't block app startup
try {
  const {startNetworkLogging} = require('react-native-network-logger');
  startNetworkLogging();
} catch (e) {
  if (__DEV__) {
    console.warn('Network logger init failed:', e?.message);
  }
}

try {
  const ZegoUIKitPrebuiltCallService = require('@zegocloud/zego-uikit-prebuilt-call-rn').default;
  const ZIM = require('zego-zim-react-native');
  ZegoUIKitPrebuiltCallService.useSystemCallingUI([ZIM]);
} catch (e) {
  if (__DEV__) {
    console.warn('Zego init failed:', e?.message);
  }
}
