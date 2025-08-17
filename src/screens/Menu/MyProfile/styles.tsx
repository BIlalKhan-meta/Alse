import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bioSection: {
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },

  location: {
    fontSize: 14,
    color: '#666',
  },

  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  postsSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  postsContainer: {
    paddingBottom: 80,
  },
  postsRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  postItem: {
    width: '48%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0C959B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  fabMenu: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default styles;
