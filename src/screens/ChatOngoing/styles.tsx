import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw * 4,
    paddingVertical: vh * 1.5,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: vw * 3,
    padding: 4,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: colors.black,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: vw * 3,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 2,
  },
  userStatus: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '400',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: vw * 2,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerButton: {
    padding: 10,
  },
  savedConatiner: {
    width: vw * 9,
    height: vw * 9,
    borderRadius: vw * 4.5,
    backgroundColor: colors.white,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveicon: {
    width: vw * 4,
    height: vh * 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
    backgroundColor: 'yellow',
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 8,
  },
  composer: {
    // borderRadius: 20,
    // borderWidth: 1,
    // borderColor: '#ddd',
    // paddingHorizontal: 10,
    // marginRight: 5,
    // backgroundColor: "yellow",
    color: colors.black,
  },
  timeText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
    marginTop: 5,
  },
  messagesContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: vw * 2,
  },
  leftAlignMessageContainer: {
    backgroundColor: '#E8F5E8',
    marginVertical: vh * 0.5,
    marginHorizontal: vw * 2,
  },
  rightAlignMessageContainer: {
    backgroundColor: '#00BCD4',
    marginVertical: vh * 0.5,
    marginHorizontal: vw * 2,
  },
  erroMsg: {
    color: '#FF0000',
    fontSize: fontSizes.f14,
    textAlign: 'center',
  },
  sendContainerBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendContainerStyle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: vw * 2,
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: colors.white,
  },
  smileyIcon: {
    marginRight: vw * 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: vw * 4,
    paddingVertical: vh * 1,
    minHeight: 60,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: vw * 4,
    paddingVertical: vh * 1,
    flex: 1,
    marginRight: vw * 2,
    minHeight: 40,
  },
  messageTxt: {
    fontSize: fontSizes.f14,
    color: colors.black,
  },
  messageTxtSelf: {
    fontSize: fontSizes.f14,
    color: colors.white,
  },
  inputToolbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // backgroundColor: "green"
  },
  leftButton: {
    // paddingHorizontal: 10,
    // backgroundColor: "yellow",
    // zIndex: 100
  },
  rightButton: {
    // paddingHorizontal: 10,
  },
  likeBtn: {
    width: vw * 8,
    height: vh * 4,
    bottom: vh * 2,
  },
  mediaBtn: {
    width: vw * 9,
    height: vh * 4,
    bottom: vh * 2,
  },
  textInputStyle: {
    color: colors.black,
    fontSize: 16,
    paddingTop: 8,
    paddingBottom: 8,
    flex: 1,
  },
  inputToolbarStyle: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    flex: 1,
  },
  primaryStyle: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  attachIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  micButton: {
    padding: 8,
    marginLeft: 8,
  },
  micIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: vw * 2,
  },
  scrollToBottomStyle: {
    backgroundColor: '#00BCD4',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: vw * 6,
    width: vw * 85,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: vh * 1,
  },
  modalSubtitle: {
    fontSize: fontSizes.medium,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: vh * 2,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: vw * 4,
    paddingVertical: vh * 1.5,
    fontSize: fontSizes.medium,
    marginBottom: vh * 2,
    backgroundColor: colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: vh * 1.5,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: vw * 1,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: colors.black,
    fontSize: fontSizes.medium,
    fontWeight: '500',
  },
  callButtonText: {
    color: colors.white,
    fontSize: fontSizes.medium,
    fontWeight: '600',
  },
});

export default styles;
