import EventEmitter from 'eventemitter3';

const eventEmitter = new EventEmitter();

export const EVENT_TYPES = {
  CHECKOUT_TRIGGER: 'CHECKOUT_TRIGGER',
  Subscription: 'Subscription',
  NOTIFICATION_BADGE_UPDATED: 'NOTIFICATION_BADGE_UPDATED',
  FCM_FOREGROUND_RECEIVED: 'FCM_FOREGROUND_RECEIVED',
  UPLOAD_PROGRESS: 'UPLOAD_PROGRESS',
  UPLOAD_COMPLETE: 'UPLOAD_COMPLETE',
};

export default eventEmitter;
