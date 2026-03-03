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
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: t('toast.failedGoogleAuth'),
        });
        return;
      }

      return onSuccess(idToken);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('toast.failedGoogleAuth'),
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
