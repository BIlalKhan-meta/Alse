import re

with open('src/screens/ChatScreen/styles.tsx', 'r') as f:
    content = f.read()

new_styles = """import {Platform, StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8FAFE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageTemplatesButton: {
    borderWidth: 1,
    borderColor: '#379696',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  manageTemplatesText: {
    color: '#379696',
    fontSize: 12,
    fontWeight: '500',
  },
  newGroupButton: {
    backgroundColor: '#379696',
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  newGroupButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.black,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    marginRight: 5,
  },
  filterPopup: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 5,
    width: 100,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 20,
  },
  filterPopupItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  filterPopupText: {
    fontSize: 14,
    color: colors.black,
  },
  chatListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatList: {
    paddingBottom: 100,
  },
  chatCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  chatCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  chatCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  chatCardTitleCol: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  moreButton: {
    padding: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  popupMenu: {
    position: 'absolute',
    top: 40,
    right: 15,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 5,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  popupMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  popupMenuText: {
    fontSize: 14,
    color: colors.black,
  },
});
export default styles;
"""

with open('src/screens/ChatScreen/styles.tsx', 'w') as f:
    f.write(new_styles)

print("Replaced styles.tsx successfully")
