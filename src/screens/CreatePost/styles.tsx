import {Platform, StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

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
});

export default styles;
