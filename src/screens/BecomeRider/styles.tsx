import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 0,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 0,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  formFields: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 25,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333333',
    backgroundColor: 'transparent',
  },
  submitButton: {
    backgroundColor: '#0C959B',
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
