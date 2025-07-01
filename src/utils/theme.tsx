import {Platform} from 'react-native';

export const colors = {
  inputcolor: '#F8FAFE',
  chatInput: '#F6F6F6',
  lightColor: '#F9F9F9',
  inputText: '#333333',
  white: '#fff',
  black: '#000',
  themeColor: '#0C959B',
  redText: '#FF0000',
  redStatus: '#C90505',
  redShadeLight: '#FFF3F3',
  lightGrey: '#666666',
  blue: '#169BD5',
  borderColor: '#D9D9D9',
  headerColor: '#FFFFFF',
  darkGray: '#666666',
  camBg: '#E7F7FE',
  inputBorder: '#E3E3E3',
  green: '#0C959B',
  midGray: '#EFEFEF',
  midDark: '#8E8E8E',
};

export const appShadow: Record<string, any> = {
  shadowColor: colors.black,
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: Platform.OS == 'ios' ? 0.2 : 0.9,
  shadowRadius: 8,
  elevation: 2,
};
