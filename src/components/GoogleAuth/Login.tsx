import { ActivityIndicator, Image, StyleSheet } from 'react-native';
import CustomButton from '../CustomButton';
import styles from './styles';
import { signInWithGoogle } from './GoogleService';
import Toast from 'react-native-toast-message';
import { colors } from '../../utils/theme';

export default function GoogleLogin({ onSuccess, loading }: { onSuccess: (user: any) => void, loading: boolean }) {

    const handleGoogleLogin = async () => {
        const userInfo = await signInWithGoogle();

        if (!userInfo) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to sign in with Google',
            });
            return;
        }

        return onSuccess(userInfo.data?.idToken);
    }

    return (
        <CustomButton onPress={ () => { handleGoogleLogin() } } style={ styles.googleButton }>
            { loading ? (
                <ActivityIndicator size={ 'large' } color={ colors.white } />
            ) : (
                <Image source={ require('./images/googleLogin.png') } style={ styles.googleLogin } />
            ) }
        </CustomButton>
    )
}