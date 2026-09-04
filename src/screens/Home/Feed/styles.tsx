import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/theme';
import {DEVICE_WIDTH, fontSizes, vh, vw} from '../../../constant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.headerColor,
    paddingHorizontal: 15,
    paddingTop: 30,
    height: '100%',
  },

  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  fabMenuContainer: {
    position: 'absolute',
    bottom: vh * 1,
    // right: vw * 10, // TODO change to vh * 10 after removing network logger fab
    right: 60, // TODO change to vh * 10 after removing network logger fab
    alignItems: 'center',
    zIndex: 999,
  },
  fabButton: {
    position: 'absolute',
    bottom: 16,
    right: -vh * 8,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#009688', // Teal color matching screenshot
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 65, // Position above the FAB
    left: -80,
    backgroundColor: '#009688', // Teal color matching screenshot
    borderRadius: 4,
    width: 120,
    paddingVertical: 8,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputcolor,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonIcon: {
    width: 17,
    height: 10,
  },
  buttonIcon2: {
    width: 16,
    height: 15,
  },
  buttonText: {
    color: colors.inputText,
    fontSize: 16,
    marginLeft: 5,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: vw * 6,
    paddingVertical: vh * 6,
  },
  emptyTitle: {
    fontSize: fontSizes.f16,
    color: colors.inputText,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: vh * 1.5,
    fontSize: fontSizes.f14,
    color: colors.lightGrey,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    marginVertical: vh * 4,
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#EAF6F6',
  },
  contentContainer: {
    paddingHorizontal: vh * 2,
    flex: 1,
    minHeight: 0,
  },
  storiesWrap: {
    flexShrink: 0,
    zIndex: 1,
  },
  feedContainer: {
    flex: 1,
    minHeight: 0,
  },
  feedTopSection: {
    zIndex: 20,
    elevation: 20,
    flexShrink: 0,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: vh * 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    gap: vh * 0.8,
  },
  feedList: {
    flex: 1,
  },
  feedListContent: {
    paddingBottom: vh * 10,
    backgroundColor: colors.white,
  },
  loadMoreFooter: {
    paddingVertical: vh * 2,
    alignItems: 'center',
  },
  loaderOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  loaderContent: {
    backgroundColor: colors.white,
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 160,
  },
  loaderText: {
    marginTop: 12,
    fontSize: fontSizes.f14,
    color: colors.black,
    fontWeight: '500',
  },
  whatsOnYourMindContainer: {
    paddingHorizontal: 15,
    overflow: 'hidden',
  },
  whatsOnYourMindTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    marginRight: 10,
  },
  whatsOnYourMindInput: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  whatsOnYourMindText: {
    color: '#65676B',
    fontSize: 14,
  },
  whatsOnYourMindBottom: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  whatsOnYourMindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E4E6EB',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  whatsOnYourMindButtonText: {
    color: '#65676B',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default styles;
