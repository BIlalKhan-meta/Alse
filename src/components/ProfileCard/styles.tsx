import {StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingVertical: vh * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //   alignItems: 'center',
    marginBottom: 20,
  },

  headerContainer: {
    flexDirection: 'row',
    marginBottom: vh * 2,
  },
  profileImageContainer: {
    marginRight: vw * 3,
  },
  profileImage: {
    width: vw * 16,
    height: vw * 16,
    borderRadius: vw * 8,
  },
  userInfoContainer: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vh * 1,
  },
  name: {
    fontSize: vh * 1.7,
    color: colors.black,
  },
  username: {
    fontSize: vh * 1.6,
    color: colors.darkGray,
    marginTop: vh * 0.3,
  },
  location: {
    fontSize: vh * 1.6,
    color: colors.darkGray,
  },
  bio: {
    fontSize: vh * 1.6,
    color: colors.inputText,
    lineHeight: vh * 2.2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center', // Add this to center align everything including dividers
    paddingVertical: vh * 2,
    borderColor: colors.lightGrey,
    marginTop: vh * 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1, // Make each stat item take equal space
  },
  verticalDivider: {
    height: vh * 5, // Set an appropriate height for the divider
    width: 1, // 1 pixel width for the divider
    backgroundColor: colors.midDark, // Use a light color for the divider
  },
  statNumber: {
    fontSize: vh * 2,
    color: colors.black,
  },
  statLabel: {
    fontSize: vh * 1.6,
    color: colors.darkGray,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -vh * 1,
  },
  followButton: {
    marginRight: vw * 2,
    height: vh * 5,
    backgroundColor: colors.themeColor,
  },
  messageButton: {
    height: vh * 5,
    backgroundColor: colors.midGray,
    borderWidth: 0,
  },
  menuButton: {
    position: 'absolute',
    top: vh * 2,
    right: vw * 4,
    padding: vw * 1,
  },
  menuIcon: {
    width: vw * 5,
    height: vh * 2,
    resizeMode: 'contain',
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
  // name: {
  //   fontSize: fontSizes.f24,
  //   color: colors.black,
  //   fontWeight: 'bold',
  //   marginBottom: 5,
  // },
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
  // followButton: {
  //   width: vw * 80,
  // },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  threeDots: {
    width: vh,
    height: vh * 2.5,
    // padding: vh,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default styles;
