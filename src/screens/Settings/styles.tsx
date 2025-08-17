import {StyleSheet} from 'react-native';
import {vw, vh} from '../../constant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  header: {
    paddingHorizontal: vw * 5,
    paddingBottom: vh * 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  headerTitle: {
    fontSize: 24,
    color: '#1F2937',
    textAlign: 'center',
  },

  profileSection: {
    paddingHorizontal: vw * 5,
    paddingBottom: vh * 3,
  },

  profileImageContainer: {
    alignItems: 'center',
    marginBottom: vh * 3,
    position: 'relative',
  },

  profileImage: {
    width: vw * 30,
    height: vh * 15,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
  },

  editButton: {
    width: 32,
    height: 32,
  },

  profileForm: {
    marginTop: vh * 2,
    gap: vh * 2,
  },

  inputRow: {
    flexDirection: 'row',
    gap: vw * 3,
  },

  inputContainer: {
    flex: 1,
  },

  inputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: vh * 0.5,
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: vw * 3,
    paddingVertical: vh * 1.2,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#ffffff',
  },

  textInputWithIcon: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },

  textInputWithIconInput: {
    flex: 1,
    paddingRight: vw * 12,
  },

  inputIcon: {
    position: 'absolute',
    right: vw * 3,
    padding: vw * 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textArea: {
    minHeight: vh * 10,
    maxHeight: vh * 15,
  },

  settingsSection: {
    paddingHorizontal: vw * 5,
    paddingVertical: vh * 2,
  },

  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vh * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },

  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingsIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: vw * 3,
  },

  settingsItemText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: vh * 2,
  },

  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: vh * 1.5,
  },

  languageContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: vw * 2,
    marginBottom: vh * 2,
  },

  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vh * 1,
    paddingHorizontal: vw * 3,
    borderRadius: 6,
    marginVertical: vh * 0.5,
  },

  languageItemSelected: {
    backgroundColor: '#EBF8FF',
  },

  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  languageFlag: {
    fontSize: 20,
    marginRight: vw * 3,
  },

  languageText: {
    fontSize: 16,
    color: '#374151',
  },

  languageTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },

  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkmarkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  saveButton: {
    backgroundColor: '#10B981',
    marginHorizontal: vw * 5,
    marginVertical: vh * 3,
    paddingVertical: vh * 1.8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileInfo: {
    paddingHorizontal: vw * 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default styles;
