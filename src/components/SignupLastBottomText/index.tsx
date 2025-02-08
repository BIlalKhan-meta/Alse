import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';
import fonts from '../../assets/fonts';
import InterRegular from '../Text/InterRegular';


interface SignupLastBottomTextProps {
  firstText: string;
  secondText: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const SignupLastBottomText: React.FC<SignupLastBottomTextProps> = (props) => {
  return (
    <>
      <View style={[styles.textcontainer, props.style]}>
        <InterRegular style={styles.firsttext}>{props?.firstText}</InterRegular>
        <TouchableOpacity onPress={props?.onPress}>
          <InterRegular style={styles.secondtext}>{props?.secondText}</InterRegular>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  textcontainer: {
    marginTop: vh * 3,
  },
  firsttext: {
    marginRight: vw * 1.3,
    color: colors.inputText,
    fontSize: fontSizes.f12
  },
  secondtext: {
    color: colors.themeColor,
    textDecorationLine: 'underline',
    fontSize: fontSizes.f12


  }
});

export default SignupLastBottomText;