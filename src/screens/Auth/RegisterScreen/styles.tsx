import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/theme';
import {fontSizes, vh, vw} from '../../../constant';
import fonts from '../../../assets/fonts';

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: colors.white,
    height: vh * 100
  },
  container: {
    alignItems: 'center',
    paddingTop: vh * 2,
    paddingHorizontal: vw * 5,
    // flex: 1,
  },
  googleButton: {
    borderWidth: 0,
    marginTop: vh * 2,
    backgroundColor: "#0C959B1A",
    width: "100%",
    paddingLeft: 20,
    paddingTop: 5,
    borderRadius: 20,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vh * 2,
  },
  lineText: {
    color: '#61677D',
    fontSize: fontSizes.f11,
    lineHeight: 22,
    textAlign: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E5EC'
  },
  googleLogin: {
    
  },
  input: {
    backgroundColor: "#0C959B1A",
    // fontFamily: fonts.Inter.Bold,
    color: colors.black,
    fontSize: fontSizes.f11,
    height: vh * 6,
    width: vw * 85,
    fontWeight: '300',
    borderColor: '#0C959B',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  subHeading : {
    color: '#61677D',
    fontSize: fontSizes.f11,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: vh * 1,
    marginBottom: vh * 2,
  },
  cardStyle: {
    alignItems: 'center',
    flex: 1,
    paddingTop: vh * 2,
  },
  heading: {
    color: colors.green,
    fontSize: fontSizes.f20,
    // fontWeight: "600"
  },
  bottomStyle: {
    paddingTop: vh * 5
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginImage: {
    width: 90,
    height: 90,
  },
  loginBtn: {
    marginTop: vh * 5,
    width: vw * 85,
    borderRadius: 15,
  },
  bottomText: {
    color: colors.darkGray,
    fontFamily: fonts.Poppins.Regular,
    fontSize: fontSizes.f11,
    alignContent: 'flex-start'
  },
  signUpText: {
    color: colors.green,
    fontSize: fontSizes.f11,
  },
  bottomContainer: {
    paddingHorizontal: vw * 8,
    width: '100%',
    marginTop: vh * 2,
  },
  bottomTextContainer: {
    backgroundColor: 'white',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 10
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: vh * 2
  },
  forgotPasswordText: {
    color: colors.darkGray,
    fontSize: fontSizes.f11,
  },
  checkboxcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: vw * 4,
    marginTop: vh * 2
  }
});

export default styles;
