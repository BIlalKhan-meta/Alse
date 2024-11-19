import EventEmitter from 'eventemitter3';

const eventEmitter = new EventEmitter();

export const EVENT_TYPES = {
  CHECKOUT_TRIGGER: 'CHECKOUT_TRIGGER',
  Subscription: 'Subscription',
};

export default eventEmitter;
