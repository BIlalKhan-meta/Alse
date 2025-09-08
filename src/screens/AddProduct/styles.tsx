import {StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 0,
    marginLeft: 8,
    paddingHorizontal: 0,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#999',
  },
  dropdownTextSelected: {
    color: '#333',
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  fileStatusContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fileStatusText: {
    fontSize: 16,
    color: '#333',
  },
  addProductButton: {
    backgroundColor: '#00A19D',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addProductButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  dropdownStyle: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    minHeight: 48,
  },
});

export default styles;
