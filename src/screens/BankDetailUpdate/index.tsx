// EditBankDetailScreen.tsx
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import * as yup from 'yup';

import styles from './styles'; // Ensure you have your styles defined
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import DropdownPicker from '../../components/DropdownPicker';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import GeneralModal from '../../components/GeneralModal';
import { images } from '../../utils/images';
import { colors } from '../../utils/theme';
import CustomButton from '../../components/CustomButton';
import InterRegular from '../../components/Text/InterRegular';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';

const BankDetailUpdate: React.FC = () => {
    const navigation = useNavigation()
    const [detailUpdate, setDetailUpdate] = useState<boolean>(false)

    const accountTypes = [
        { label: 'Savings', value: 'savings' },
        { label: 'Checking', value: 'checking' },
    ];

    const banks = [
        { label: 'Bank 1', value: 'bank1' },
        { label: 'Bank 2', value: 'bank2' },
    ];

    const validationSchema = yup.object().shape({
        accountHolderName: yup.string().required('Account Holder Name is required'),
        accountType: yup.string().required('Account Type is required'),
        bankName: yup.string().required('Bank Name is required'),
        routingNumber: yup.string().required('Routing Number is required'),
        confirmRoutingNumber: yup.string()
            .oneOf([yup.ref('routingNumber'), null], 'Routing Numbers must match')
            .required('Confirm Routing Number is required'),
        accountNumber: yup.string().required('Account Number is required'),
        confirmAccountNumber: yup.string()
            .oneOf([yup.ref('accountNumber'), null], 'Account Numbers must match')
            .required('Confirm Account Number is required'),
    });

    const initialValues = {
        accountHolderName: '',
        accountType: accountTypes[0].value,
        bankName: banks[0].value,
        routingNumber: '',
        confirmRoutingNumber: '',
        accountNumber: '',
        confirmAccountNumber: '',
    };

    const handleSubmit = (values: any) => {
        console.log('Form submitted:', values);
    };
    const handleDropdownChange = (value: string | null) => {
        console.log('Selected value:', value);
    };
    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },

        });
    }, [navigation]);
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <KeyboardAwareScrollView
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.container}>
                            <Card style={styles.contentContainer}>

                                <RegularTextInput
                                    label="Account Holder Number *"
                                    placeholder="Enter account holder Name"
                                    placeholderTextColor={colors.inputText}
                                    onChangeText={handleChange('accountHolderName')}
                                    onBlur={handleBlur('accountHolderName')}
                                    value={values.accountHolderName}
                                    error={touched.accountHolderName && errors.accountHolderName}
                                    style={styles.inputStyle}
                                />

                                {/* <DropDownTextInput
                            label="Account type"
                            items={accountTypes}
                            selectedValue={values.accountType}
                            onValueChange={handleChange('accountType')}
                            style={styles.dropdown}
                        /> */}

                                <InterRegular style={styles.countryLabel}>
                                    Account type
                                </InterRegular>

                                <View style={styles.dropdownContainer}>
                                    <DropDownTextInput
                                        items={accountTypes}
                                        // defaultValue='all'
                                        placeholder="Select Account type"
                                        onChangeValue={handleDropdownChange}
                                        style={styles.dropDown}
                                    />
                                </View>

                                <InterRegular style={styles.countryLabel}>
                                    Bank Name
                                </InterRegular>

                                <View style={[styles.dropdownContainer, { zIndex: 4 }]}>
                                    <DropDownTextInput
                                        items={banks}
                                        // defaultValue='all'
                                        placeholder="Select Bank Name"
                                        onChangeValue={handleDropdownChange}
                                        style={styles.dropDown}
                                    />
                                </View>

                                {/* <DropDownTextInput
                            label="Bank Name"
                            items={banks}
                            selectedValue={values.bankName}
                            onValueChange={handleChange('bankName')}
                            style={styles.dropdown}
                        /> */}

                                <RegularTextInput
                                    label="Routing Number *"
                                    placeholder="Enter Routing Number"
                                    placeholderTextColor={colors.inputText}
                                    onChangeText={handleChange('routingNumber')}
                                    onBlur={handleBlur('routingNumber')}
                                    value={values.routingNumber}
                                    error={touched.routingNumber && errors.routingNumber}
                                    style={styles.inputStyle}
                                />

                                <RegularTextInput
                                    label="Confirm Routing Number *"
                                    placeholder="Confirm Routing Number"
                                    placeholderTextColor={colors.inputText}
                                    onChangeText={handleChange('confirmRoutingNumber')}
                                    onBlur={handleBlur('confirmRoutingNumber')}
                                    value={values.confirmRoutingNumber}
                                    error={touched.confirmRoutingNumber && errors.confirmRoutingNumber}
                                    style={styles.inputStyle}
                                />

                                <RegularTextInput
                                    label="Account Number *"
                                    placeholder="Enter Account Number"
                                    placeholderTextColor={colors.inputText}
                                    onChangeText={handleChange('accountNumber')}
                                    onBlur={handleBlur('accountNumber')}
                                    value={values.accountNumber}
                                    error={touched.accountNumber && errors.accountNumber}
                                    style={styles.inputStyle}
                                />

                                <RegularTextInput
                                    label="Confirm Account Number *"
                                    placeholder="Confirm Account Number"
                                    placeholderTextColor={colors.inputText}
                                    onChangeText={handleChange('confirmAccountNumber')}
                                    onBlur={handleBlur('confirmAccountNumber')}
                                    value={values.confirmAccountNumber}
                                    error={touched.confirmAccountNumber && errors.confirmAccountNumber}
                                    style={styles.inputStyle}
                                />

                                <CustomButton style={styles.updateButton} onPress={() => {
                                    handleSubmit
                                    setDetailUpdate(true)
                                }}>
                                    UPDATE
                                </CustomButton>
                            </Card>
                            <GeneralModal
                                visible={detailUpdate}
                                closeModal={() => setDetailUpdate(false)}
                                icon={images.checkedIcon}
                                title='Bank Detail Update'
                                message='Bank Detail Has Been Updated Successfully'
                                buttonText='OK'
                                onPress={() => {
                                    setDetailUpdate(false)
                                    navigation.navigate("BankDetail")
                                }
                                }
                                primaryBtn={true}
                            />

                        </View>
                    </KeyboardAwareScrollView>
                )}
            </Formik>
        </ScrollView>

    );
};

export default BankDetailUpdate;
