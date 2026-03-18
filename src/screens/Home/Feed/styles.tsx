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
    height: '100%',
  },
  emptyText: {
    marginVertical: vh * 4,
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    paddingHorizontal: vh * 2,
    flex: 1,
  },
  feedContainer: {
    flex: 1,
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
});

export default styles;
