import { Platform } from "react-native";

export const colors = {
  inputcolor: '#F8FAFE',
  chatInput: "#F6F6F6",
  lightColor: "#F9F9F9",
  inputText: "#333333",
  white: '#fff',
  black: '#000',
  themeColor: "#0C959B",
  redText: '#FF0000',
  lightGrey: "#666666",
  blue: "#169BD5",
  borderColor: '#D9D9D9',
  headerColor: "#EDFAFA",
  darkGray: '#666666',
  camBg: "#E7F7FE"

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
