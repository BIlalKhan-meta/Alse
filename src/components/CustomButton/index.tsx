import { ActivityIndicator, Button, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';
import fonts from '../../assets/fonts';

interface ButtonProps {
    style?: StyleProp<TextStyle>;
    txtstyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    onPress: () => void;
    children: React.ReactNode;
    loading: boolean;
    disable: boolean;

}

const CustomButton: React.FC<ButtonProps> = (props) => {

    return (
        <>
            <View style={[styles.buttoncontainer, props?.containerStyle]}>
                <TouchableOpacity
                    disabled={props.disable}
                    onPress={props?.onPress}
                    style={[styles.button, props.style]}>

                    {props?.loading ? (
                        <ActivityIndicator size={'large'} color={colors.white} />
                    ) : (
                        <Text style={[styles.text, props.txtstyle]}>
                            {props.children}
                        </Text>
                    )}


                </TouchableOpacity>
            </View>
        </>

    )
}

const styles = StyleSheet.create({
    buttoncontainer: {
        marginTop: vh * 3
    },
    button: {
        backgroundColor: colors.themeColor,
        height: vh * 6,
        width: vw * 45,
        fontWeight: '300',
        borderColor: colors.themeColor,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        textTransform: 'capitalize',
        justifyContent: 'center'
    },
    text: {
        color: colors.white,
        textAlign: 'center',
        fontWeight: '400',
        fontSize: fontSizes.f16,
        fontFamily: fonts.Inter.Regular,
    },

});

export default CustomButton;