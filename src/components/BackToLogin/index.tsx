import { TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import InterRegular from '../Text/InterRegular';
import { fontSizes, vh } from '../../constant';

interface BackToLoginProps {
  onPress: () => void;
}

const BackToLogin: React.FC<BackToLoginProps> = (props) => {

  const { onPress } = props;

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={onPress}>
          <InterRegular
            style={styles.logintext}
          >Back To Login</InterRegular>
        </TouchableOpacity>

      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginTop: vh * 4,
  },
  logintext: { color: colors.themeColor, fontSize: fontSizes.f12, borderBottomWidth: 1, borderBottomColor: colors.themeColor },
});

export default BackToLogin;