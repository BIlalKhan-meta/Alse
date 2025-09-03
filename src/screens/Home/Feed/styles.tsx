import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/theme';
import {vh, vw} from '../../../constant';

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
    bottom: vh * 8,
    right: vw * 14, // TODO change to vh * 10 after removing network logger fab
    alignItems: 'center',
    zIndex: 999,
  },
  fabButton: {
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
});

export default styles;
