import {StyleSheet, Dimensions} from 'react-native';
import {colors} from '../../utils/theme';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midGray,
  },

  // Profile Section
  profileSection: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.lightGrey,
  },

  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    gap: 8,
  },

  sectionTitle: {
    fontSize: 18,
    color: colors.themeColor,
    fontWeight: '600',
  },

  // Settings Section
  settingsSection: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Settings Item
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    backgroundColor: colors.white,
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
    backgroundColor: colors.lightColor,
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsTextContainer: {
    flex: 1,
  },

  settingsItemText: {
    fontSize: 16,
    color: colors.themeColor,
    fontWeight: '500',
  },

  settingsItemSubtitle: {
    fontSize: 14,
    color: colors.inputText,
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

  // Remove bottom border from last item
  'settingsItem:last-child': {
    borderBottomWidth: 0,
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
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
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
    backgroundColor: colors.themeColor,
    paddingVertical: 14,
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

  // Danger Zone Styles
  dangerSection: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FEF2F2',
  },

  dangerText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '500',
  },

  dangerSubtext: {
    fontSize: 14,
    color: '#991B1B',
    marginTop: 2,
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

  // Responsive adjustments
  ...(width < 375 && {
    settingsItem: {
      paddingVertical: 14,
    },
    settingsItemText: {
      fontSize: 15,
    },
    profileImage: {
      width: 70,
      height: 70,
      borderRadius: 35,
    },
  }),

  // Dark mode styles (can be conditionally applied)
  darkContainer: {
    backgroundColor: colors.darkGray || '#1A1A1A',
  },

  darkSettingsSection: {
    backgroundColor: colors.darkGray || '#2A2A2A',
  },

  darkSettingsItem: {
    backgroundColor: colors.darkGray || '#2A2A2A',
    borderBottomColor: colors.darkGray || '#404040',
  },

  darkText: {
    color: colors.black || '#FFFFFF',
  },

  darkinputText: {
    color: colors.midGray || '#B0B0B0',
  },

  // Accessibility improvements
  accessibleTouchArea: {
    minHeight: 44,
    minWidth: 44,
  },

  // Animation support
  fadeIn: {
    opacity: 1,
  },

  fadeOut: {
    opacity: 0.3,
  },
});

export default styles;
