import {requestPushPermissionAndToken} from '../services/pushNotificationService';

export const requestUserPermission = requestPushPermissionAndToken;

class NotificationListener {
  constructor() {
    this.hasBeenCalled = false;
  }

  init() {
    if (this.hasBeenCalled) {
      return;
    }
    this.hasBeenCalled = true;
  }
}

export const notificationListenerInstance = new NotificationListener();
