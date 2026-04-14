import {Platform, StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {DEVICE_WIDTH, fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Image Section
  imageSection: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.white,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  removeIcon: {
    width: 12,
    height: 12,
    tintColor: colors.white,
  },
  addImageButton: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPickRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  mediaPickHalf: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  mediaPickLabel: {
    fontSize: fontSizes.f14,
    color: '#999999',
    fontWeight: '500',
    marginTop: 8,
  },
  recentVideoThumb: {
    width: '100%',
    height: '100%',
  },
  addImageIcon: {
    width: 50,
    height: 50,
    tintColor: '#CCCCCC',
    marginBottom: 10,
  },
  addImageText: {
    fontSize: fontSizes.f16,
    color: '#999999',
    fontWeight: '500',
  },

  // Description Section
  descriptionSection: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: vh * 30,
  },
  descriptionInput: {
    fontSize: fontSizes.f16,
    color: colors.black,
    lineHeight: 24,
    minHeight: vh * 20,
  },

  // Post Button (in header)
  postButton: {
    minWidth: vw * 20,
    height: vh * 5,
    margin: 0,
    marginRight: 15,
    backgroundColor: colors.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  postTxt: {
    color: colors.white,
    fontSize: fontSizes.f13,
  },

  // add from old commit
  cancelText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  mainImageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5F5F5',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999999',
  },
  recentsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  recentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666666',
  },
  recentsList: {
    paddingBottom: 20,
  },
  recentRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentImageContainer: {
    width: (DEVICE_WIDTH - 44) / 2,
    height: (DEVICE_WIDTH - 44) / 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  recentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.themeColor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabButtonDisabled: {
    opacity: 0.5,
  },
  // Details Step Styles
  detailsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  descriptionInputContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  optionsContainer: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
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
