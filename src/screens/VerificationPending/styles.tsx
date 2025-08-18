import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 0,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    marginLeft: -32, // Offset the back button width to center the title
  },
  headerSpacer: {
    width: 32, // Same as back button width for centering
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    // paddingTop: 20,
  },
  messageContainer: {
    marginBottom: 30,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    textAlign: 'left',
  },
  userInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  userRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  userLabel: {
    fontSize: 14,
    color: '#666666',
    width: 40,
    fontWeight: '500',
  },
  userValue: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  homeButton: {
    backgroundColor: '#0C959B',
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
