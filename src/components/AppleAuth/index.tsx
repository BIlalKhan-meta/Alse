import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import appleAuth from '@invertase/react-native-apple-authentication';
import {colors} from '../../utils/theme';
import {vh} from '../../constant';
import Icon from 'react-native-vector-icons/FontAwesome6';

const AppleAuth = ({
  onSuccess,
  loading,
}: {
  onSuccess: (user: any) => void;
  loading: boolean;
}) => {
  const onAppleButtonPress = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      let userName = '';

      let {email, fullName} = appleAuthRequestResponse;

      if (!fullName || !fullName.givenName) {
        userName = `Apple User ${appleAuthRequestResponse.user.substring(
          0,
          8,
        )}`;
      } else {
        userName = fullName.givenName;
      }

      console.log('appleAuthRequestResponse', appleAuthRequestResponse);

      onSuccess({
        apple_id: appleAuthRequestResponse.user,
        email,
        fullName: userName,
        isAppleLogin: true,
      });
    } catch (error) {
      console.error('Apple Sign In Error:', error);
    }
  };

  if (!appleAuth.isSupported) {
    return null;
  }

  if (loading) {
    return (
      <TouchableOpacity style={styles.appleButtonLoading} disabled={true}>
        <ActivityIndicator size={'large'} color={colors.white} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.appleButton} onPress={onAppleButtonPress}>
      <View style={styles.buttonContent}>
        <Icon
          name="apple"
          size={20}
          color="#000"
          iconStyle="brand"
          style={styles.appleIcon}
        />
        <Text style={styles.buttonText}>Sign in with Apple</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  appleButton: {
    borderWidth: 0,
    marginTop: vh * 2,
    backgroundColor: '#0C959B1A',
    width: '100%',
    paddingLeft: 20,
    paddingVertical: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1c',
  },
  appleButtonLoading: {
    borderWidth: 0,
    marginTop: vh * 2,
    backgroundColor: '#0C959B1A',
    width: '100%',
    paddingLeft: 20,
    paddingTop: 5,
    borderRadius: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppleAuth;
