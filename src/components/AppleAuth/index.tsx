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
import {useTranslation} from 'react-i18next';
import Toast from 'react-native-toast-message';

const AppleAuth = ({
  onSuccess,
  loading,
}: {
  onSuccess: (user: any) => void;
  loading: boolean;
}) => {
  const {t} = useTranslation();
  const onAppleButtonPress = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      const {
        user: appleUserId,
        email,
        fullName,
        identityToken,
        authorizationCode,
      } = appleAuthRequestResponse;

      if (!identityToken || !appleUserId) {
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: 'Apple Sign In failed. Missing identity token.',
        });
        return;
      }

      let userName = '';
      if (!fullName || !fullName.givenName) {
        userName = `Apple User ${appleUserId.substring(0, 8)}`;
      } else {
        userName = [fullName.givenName, fullName.familyName]
          .filter(Boolean)
          .join(' ');
      }

      onSuccess({
        apple_id: appleUserId,
        email: email || '',
        fullName: userName,
        givenName: fullName?.givenName || '',
        familyName: fullName?.familyName || '',
        identityToken,
        authorizationCode: authorizationCode || '',
        isAppleLogin: true,
      });
    } catch (error: any) {
      if (error?.code === appleAuth.Error.CANCELED) {
        return;
      }
      console.error('Apple Sign In Error:', error);
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: error?.message || 'Apple Sign In failed.',
      });
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
        <Text style={styles.buttonText}>{t('signIn.appleAuth')}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default AppleAuth;

const styles = StyleSheet.create({
  appleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: vh * 5.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vh * 1.5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  appleButtonLoading: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: vh * 5.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vh * 1.5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appleIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
