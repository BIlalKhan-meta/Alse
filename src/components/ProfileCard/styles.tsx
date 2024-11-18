import { StyleSheet } from "react-native";
import { fontSizes, vh, vw } from "../../constant";
import { colors } from "../../utils/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingTop: vh * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //   alignItems: 'center',
    marginBottom: 20,
  },
  smallbtn: {
    minWidth: vw * 38,
  },
  icon: {
    width: 30,
    height: 30,
  },
  profile: {
    alignItems: 'center',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  name: {
    fontSize: fontSizes.f24,
    color: colors.black,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: fontSizes.f12,
    color: colors.inputText,
    textAlign: 'center',
    marginBottom: vh * 4,
  },
  stats: {
    fontSize: fontSizes.f12,
    color: colors.black,
    marginBottom: vh & 2,
  },
  followButton: {
    width: vw * 80
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  threeDots: {
    width: 4,
    height: 20,
  },
  imageStyle: {
    width: "100%",
    height: "100%"
  }
});


export default styles;