// styles.ts
import {StyleSheet, Dimensions} from 'react-native';
import {colors} from '../../utils/theme';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
    width: (width - 44) / 2,
    height: (width - 44) / 2,
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
  descriptionInput: {
    fontSize: 16,
    color: '#000000',
    minHeight: 80,
    textAlignVertical: 'top',
    padding: 0,
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
});

export default styles;
