import {StyleSheet, Platform} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes} from '../../constant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF6F6',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  draftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#E8EEF4',
  },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#DDE8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholderText: {
    fontSize: 20,
    color: '#7A8A99',
    fontWeight: '600',
  },
  draftBody: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  draftPreview: {
    fontSize: fontSizes.f14,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  draftPreviewEmpty: {
    fontSize: fontSizes.f14,
    color: '#8A8A8A',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  draftMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  draftBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.themeColor,
    backgroundColor: '#E6F7F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  draftTime: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
  },
  emptyText: {
    fontSize: fontSizes.f16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default styles;
