import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const vw: number = screenWidth / 100;
export const vh: number = screenHeight / 100;

export const DEVICE_WIDTH: number = screenWidth;
export const DEVICE_HEIGHT: number = screenHeight;

interface FontSizes {
  [key: string]: number;
}

export const fontSizes: FontSizes = {
  f40: vh * 5.8,
  f36: vh * 5.2,
  f34: vh * 4.91,
  f32: vh * 4.64,
  f30: vh * 4.37,
  f28: vh * 4.1,
  f26: vh * 3.75,
  f24: vh * 3.52,
  f20: vh * 2.93,
  f18: vh * 2.65,
  f16: vh * 2.35,
  f15: vh * 2.3,
  f14: vh * 2.1,
  f13: vh * 1.9,
  f12: vh * 1.8,
  f11: vh * 1.7,
  f10: vh * 1.5,
  f9: vh * 1.3,
  f8: vh * 1.1,
  f6: vh * 0.8,
};