import {Platform, StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  cardStyle: {
    margin: vh * 2,
    flex: 1,
    paddingVertical: vh * 1,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw * 4,
    paddingVertical: vh * 2,
    marginTop: vh * 4,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.themeColor,
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: vw * 4,
    position: 'relative',
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: colors.gray,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5722',
  },
  searchContainer: {
    paddingHorizontal: vw * 4,
    paddingVertical: vh * 1,
    backgroundColor: colors.white,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: vw * 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    paddingVertical: vh * 2,
    paddingHorizontal: vw * 6,
    marginRight: vw * 4,
    // backgroundColor: 'red',
    // width: '33%',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.themeColor,
  },
  tabText: {
    fontSize: 16,
    color: colors.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.themeColor,
    fontWeight: 'bold',
  },
  chatListContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: colors.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  plusBtn: {
    backgroundColor: colors.btnColor,
    justifyContent: 'center',
    alignItems: 'center',
    // width: vw * 6,
    // height: vw * 6,
    // borderRadius: vw * 3
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  plusText: {
    fontSize: fontSizes.f14,
    color: colors.white,
    fontWeight: 'bold',
    paddingLeft: 2,
  },
  newGroupButton: {
    flexDirection: 'row',
    backgroundColor: colors.themeColor,
    borderRadius: 8,
    // paddingVertical: 8,
    // paddingHorizontal: 16,
    // marginRight: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newGroupButtonText: {
    color: colors.white,
    // paddingLeft: vh * 2
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    marginRight: 4,
  },
  chatList: {
    paddingBottom: vh * 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: vh * 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: vw * 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: colors.white,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh * 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  time: {
    fontSize: 12,
    color: colors.gray,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.gray,
    marginTop: vh * 0.5,
    lineHeight: 18,
  },
  dotStyle: {
    width: vw * 1.5,
    height: vh * 3.8,
  },
  chatActions: {
    alignItems: 'flex-end',
  },
  lastMessageTime: {
    fontSize: 12,
    color: colors.gray,
  },
  chatActionButton: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  chatActionButtonText: {
    fontSize: 12,
    color: colors.black,
  },

  inputContainer: {
    backgroundColor: colors.inputcolor,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    borderRadius: vw * 2,
    paddingHorizontal: vw * 4,
    height: vh * 5,
    marginBottom: vh * 1.5,
  },
  searchIcon: {
    width: vw * 4,
    height: vh * 2,
    marginRight: vw * 2,
  },
  chatContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: vw * 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  fab: {
    position: 'absolute',
    bottom: vh * 3,
    right: vw * 4,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.themeColor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabIcon: {
    width: 24,
    height: 24,
    tintColor: colors.white,
  },
  headerBtn: {
    backgroundColor: colors.btnColor,
    width: vw * 10,
    height: vw * 10,
    borderRadius: vw * 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHead: {
    width: vw * 6,
    height: vw * 5,
  },
  dropdownContainer: {
    // marginTop: vh * 1.4,
    width: vw * 30,
  },
  dropDown: {
    borderColor: colors.borderColor,
    // backgroundColor: colors.dateConatiner,
    backgroundColor: colors.white,
    borderWidth: 1,
  },
  fabMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: vh * 12,
    paddingHorizontal: vw * 4,
  },
  fabMenuContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: vh * 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabMenuOption: {
    paddingVertical: vh * 2,
    paddingHorizontal: vw * 4,
  },
  fabMenuOptionFirst: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fabMenuOptionText: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '500',
  },
});
export default styles;
