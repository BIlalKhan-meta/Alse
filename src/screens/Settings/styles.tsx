import {StyleSheet, Dimensions} from 'react-native';
import {colors} from '../../utils/theme';

const {height, width} = Dimensions.get('screen');
const avatarSize = Math.min(width, height) * 0.3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  scrollContainer: {
    flex: 1,
  },

  // Header
  header: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 10,
    backgroundColor: colors.white,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.themeColor,
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeHeaderIcon: {
    backgroundColor: '#F0F0F0',
  },

  // Profile Section
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
  },

  profileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 12,
  },

  profileImage: {
    position: 'relative',
    width: avatarSize,
    height: avatarSize,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  profileName: {
    fontSize: 18,
  },

  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileUsername: {
    fontSize: 14,
    color: colors.lightGrey,
    marginLeft: 8,
  },

  profileLocation: {
    fontSize: 14,
    color: colors.lightGrey,
  },

  editButton: {
    padding: 8,
  },

  // Profile Form
  profileForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    width: '100%',
  },

  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  inputContainer: {
    marginBottom: 16,
    flex: 1,
  },

  inputLabel: {
    fontSize: 14,
    color: colors.inputText,
    marginBottom: 8,
    fontWeight: '500',
  },

  textInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.themeColor,
    backgroundColor: colors.white,
  },

  textInputWithIcon: {
    position: 'relative',
  },

  textInputWithIconInput: {
    paddingRight: 40,
  },

  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Settings Container
  settingsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Settings Item
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    backgroundColor: colors.white,
  },

  switchContainer: {
    width: 50,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsTextContainer: {
    flex: 1,
  },

  settingsItemText: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '600',
  },

  settingsItemSubtitle: {
    fontSize: 14,
    color: colors.lightGrey,
    marginTop: 2,
  },

  // Select Button
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightColor,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },

  selectButtonText: {
    fontSize: 14,
    color: colors.themeColor,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: colors.lightGrey,
    marginVertical: 8,
    opacity: 0.3,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  activeNavItem: {
    backgroundColor: colors.themeColor + '20',
  },

  navProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.midGray,
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.midGray,
    paddingHorizontal: 20,
  },

  errorText: {
    fontSize: 16,
    color: colors.inputText,
    textAlign: 'center',
    marginTop: 8,
  },

  // Modal and Picker Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.themeColor,
  },

  modalCloseButton: {
    padding: 8,
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  optionText: {
    fontSize: 16,
    color: colors.themeColor,
    marginLeft: 12,
  },

  optionSelected: {
    backgroundColor: colors.themeColor + '10',
  },

  // Save Button (for profile editing)
  saveButtonContainer: {
    marginTop: 20,
    marginHorizontal: 16,
  },

  saveButton: {
    alignSelf: 'flex-end',
    backgroundColor: colors.themeColor,
    marginTop: 8,
    paddingVertical: 14,
    marginTop: 16,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

  saveButtonDisabled: {
    backgroundColor: colors.lightGrey,
  },

  // Toggle Animation
  toggleContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },

  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // dropdown settings
  chevronIcon: {
    marginLeft: 8,
    transform: [{rotate: '0deg'}],
  },
  chevronIconRotated: {
    transform: [{rotate: '180deg'}],
  },

  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionsList: {
    flexGrow: 0,
  },

  selectedOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },

  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  // Language Selection Screen Styles
  languageHeader: {
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingLeft: 16,
  },

  globeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.themeColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  languageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },

  searchIcon: {
    marginRight: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },

  allLanguagesLabel: {
    fontSize: 14,
    color: colors.lightGrey,
    marginLeft: 4,
  },

  languageList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  selectedLanguageCard: {
    backgroundColor: colors.themeColor + '10',
    borderColor: colors.themeColor,
  },

  languageCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  languageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  languageIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.themeColor,
  },

  languageTextContainer: {
    flex: 1,
  },

  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },

  languageEnglishName: {
    fontSize: 14,
    color: colors.lightGrey,
  },
  //
  selectWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    height: 36,
    minWidth: width * 0.35,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  picker: {
    flex: 1, // <-- important, makes text visible
    color: '#111827', // text color on Android
  },

  pickerItem: {
    fontSize: 14,
    color: '#111827', // text color on iOS
  },

  // Profile form
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    alignItems: 'center',
  },
  editText: {
    color: 'white',
    fontSize: 12,
  },
  uploadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGrey,
  },
  //
  profileImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Navigation Item Styles for Marketplace Activity
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },

  navigationItemText: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '500',
  },

  navigationArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Delete/Disable Account Buttons
  deleteAccountButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  deleteAccountButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  disableAccountButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  disableAccountButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal Styles
  modalMessage: {
    fontSize: 16,
    color: colors.black,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },

  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

  // Purchase History Styles
  purchasesContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  purchaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  productImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },

  productImage: {
    width: '100%',
    height: '100%',
  },

  productDetails: {
    flex: 1,
    marginRight: 12,
  },

  productName: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '600',
    marginBottom: 4,
  },

  productId: {
    fontSize: 14,
    color: colors.lightGrey,
  },

  quantityContainer: {
    marginRight: 12,
    minWidth: 60,
    alignItems: 'center',
  },

  quantityText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },

  categoryContainer: {
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },

  categoryText: {
    fontSize: 14,
    color: colors.black,
    fontWeight: '500',
  },

  optionsButton: {
    padding: 8,
    borderRadius: 4,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 16,
    color: colors.lightGrey,
    marginBottom: 20,
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: colors.themeColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },

  // Saved Auctions Styles
  savedItemsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Shipping Address Styles
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  shippingInputContainer: {
    marginBottom: 20,
  },

  shippingTextInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.themeColor,
    backgroundColor: colors.white,
  },

  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  countryCodeContainer: {
    width: 100,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },

  countryCodePicker: {
    flex: 1,
    height: 50,
  },

  phoneNumberContainer: {
    flex: 1,
  },

  phoneNumberInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.themeColor,
    backgroundColor: colors.white,
  },

  dropdownInput: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    backgroundColor: colors.white,
  },

  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  dropdownText: {
    fontSize: 16,
    color: colors.themeColor,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    backgroundColor: colors.white,
    marginTop: 4,
  },

  shippingPicker: {
    height: 200,
  },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  halfWidth: {
    flex: 1,
  },

  shippingErrorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  // Profile form
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.themeColor,
    flex: 1,
  },
  cancelButtonText: {
    color: colors.themeColor,
  },
});

export default styles;
