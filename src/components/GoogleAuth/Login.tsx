import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import CustomButton from '../CustomButton';
import styles from './styles';
import {signInWithGoogle} from './GoogleService';
import Toast from 'react-native-toast-message';
import {colors} from '../../utils/theme';
import {useTranslation} from 'react-i18next';
import React from 'react';

export default function GoogleLogin({
  onSuccess,
  loading,
}: {
  onSuccess: (user: any) => void;
  loading: boolean;
}) {
  const handleGoogleLogin = async () => {
    const userInfo = await signInWithGoogle();
    const {t} = useTranslation();

    if (!userInfo) {
      console.log('GOOGLE ERROR', userInfo);

      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('toast.failedGoogleAuth'),
      });
      return;
    }

    return onSuccess(userInfo.data?.idToken);
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
