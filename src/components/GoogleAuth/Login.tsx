import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Image, TouchableOpacity} from 'react-native';
import Toast from 'react-native-toast-message';
import {colors} from '../../utils/theme';
import {configureGoogleSignin, signInWithGoogle} from './GoogleService';
import styles from './styles';

export default function GoogleLogin({
  onSuccess,
  loading,
}: {
  onSuccess: (user: any) => void;
  loading: boolean;
}) {
  useEffect(() => {
    configureGoogleSignin();
  }, []);

  const {t} = useTranslation();
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (!result) {
        // User cancelled sign-in
        return;
      }

      const {userInfo, tokens} = result;
      const idToken = tokens?.idToken;

      if (!idToken) {
        console.warn('[GoogleSignIn] missing idToken', {userInfo, tokens});
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: 'Google did not return an ID token. Check webClientId config.',
        });
        return;
      }

      return onSuccess(idToken);
    } catch (error: any) {
      console.warn('[GoogleSignIn] error', error?.code, error?.message, error);
      const detail =
        error?.message ||
        error?.code ||
        t('toast.failedGoogleAuth');
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: String(detail).slice(0, 120),
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        handleGoogleLogin();
      }}
      style={loading ? styles.googleButtonLoading : styles.googleButton}>
      {loading ? (
        <ActivityIndicator size={'large'} color={colors.white} />
      ) : (
        <Image
          source={require('./images/googleLogin.png')}
          style={styles.googleLogin}
        />
      )}
    </TouchableOpacity>
  );
}
