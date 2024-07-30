import { Text, View, Image, TouchableOpacity } from 'react-native';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import InterMedium from '../../components/Text/InterMedium';
import { useLayoutEffect } from 'react';
import { colors } from '../../utils/theme';
import Card from '../../components/Card';


const BankDetail: React.FC = () => {
    const navigation = useNavigation()

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },

        });
    }, [navigation]);




    return (


        <View style={styles.container}>


            <Card style={styles.contentContainer}>





                <View style={styles.txtConatiner}>
                    <InterMedium style={styles.txt}>Account Holder Name</InterMedium>
                    <InterMedium style={styles.phoneTxt}>Ad Abc</InterMedium>
                </View>

                <View style={styles.txtConatiner}>
                    <InterMedium style={styles.txt}>Account Type</InterMedium>
                    <InterMedium style={styles.phoneTxt}>Saving</InterMedium>
                </View>


                <View style={styles.txtConatiner}>
                    <InterMedium style={styles.txt}>Bank Name</InterMedium>
                    <InterMedium style={styles.phoneTxt}>Bank A</InterMedium>
                </View>

                <View style={styles.txtConatiner}>
                    <InterMedium style={styles.txt}>Routing Number</InterMedium>
                    <InterMedium style={styles.phoneTxt}>123-456-7890</InterMedium>
                </View>


                <View style={styles.txtConatiner}>
                    <InterMedium style={styles.txt}>Account Number</InterMedium>
                    <InterMedium style={styles.phoneTxt}>123-456-7890</InterMedium>
                </View>




                <CustomButton style={styles.btnConatiner}
                    onPress={() => navigation.navigate("BankDetailUpdate")}
                >
                    Edit Details
                </CustomButton>


            </Card>



        </View>

    );
};

export default BankDetail;
