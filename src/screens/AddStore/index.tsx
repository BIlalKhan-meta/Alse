import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import * as yup from 'yup';

import styles from './styles'; // Ensure you have your styles defined
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import { useNavigation, useRoute } from '@react-navigation/native';
import { images } from '../../utils/images';
import useImagePicker from '../../hooks/useImagePicker';
import GeneralModal from '../../components/GeneralModal';
import { colors } from '../../utils/theme';
import CustomButton from '../../components/CustomButton';
import InterRegular from '../../components/Text/InterRegular';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import Card from '../../components/Card';
import InterBoldSmall from '../../components/Text/InterBoldSmall';
import InterRegularSmallest from '../../components/Text/InterRegularSmallest';

const AddStore: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const title = route?.params?.title || "Create Shop";

    const { image, captureImage, chooseImageFromLibrary } = useImagePicker();
    const [shopSuccess, setShopSuccess] = useState(false);
    const [submitted, setSubmitted] = useState<boolean>(false)


    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },
            title: title,

        });
    }, [navigation]);



    const accountTypes = [
        { label: 'Savings', value: 'savings' },
        { label: 'Checking', value: 'checking' },
    ];

    const banks = [
        { label: 'Bank 1', value: 'bank1' },
        { label: 'Bank 2', value: 'bank2' },
    ];

    const validationSchema = yup.object().shape({
        shopName: yup.string().required('Shop Name is required'),
        // shopImage: yup.string().required('Shop Image is required'),
        accountHolderName: yup.string().required('Account Holder Name is required'),
        // accountType: yup.string().required('Account Type is required'),
        // bankName: yup.string().required('Bank Name is required'),
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
        shopName: '',
        // shopImage: '',
        accountHolderName: '',
        // accountType: '',
        // bankName: '',
        routingNumber: '',
        confirmRoutingNumber: '',
        accountNumber: '',
        confirmAccountNumber: '',

    };

    const handleDropdownChange = (value: string | null) => {
        console.log('Selected value:', value);
    };

    const handleSubmit = (values: object, { resetForm }: { resetForm: () => void }) => {
        console.log("SUBMITTED")
        setShopSuccess(true);  // Set the modal for success message
        resetForm()

    }


    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
        >


            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                    handleSubmit(values, resetForm);
                }}
            >
                {({ handleChange, handleBlur, handleSubmit, resetForm, values, errors, touched }) => (
                    <>
                        <Card style={styles.contentContainer}>
                            <RegularTextInput
                                label="Shop Name *"
                                placeholder="Enter Shop Name"
                                placeholderTextColor={colors.inputText}
                                onChangeText={handleChange('shopName')}
                                onBlur={handleBlur('shopName')}
                                value={values.shopName}
                                submitted={submitted}
                                errors={errors.shopName}
                                style={styles.inputStyle}
                            />


                            <InterRegular style={styles.dropdownLabel}>
                                Banner Image*
                            </InterRegular>

                            <TouchableOpacity style={styles.uploadBtn}
                                onPress={() => captureImage('photo')}
                            >
                                <InterRegular style={styles.uploadTxt}>
                                    Upload
                                </InterRegular>
                                <Image source={images.upload} style={styles.uploadImg} />
                            </TouchableOpacity>


                            <InterBoldSmall style={styles.heading}>
                                Bank Information
                            </InterBoldSmall>


                            <RegularTextInput
                                label="Account Holder Number *"
                                placeholder="Enter account holder Name"
                                placeholderTextColor={colors.inputText}
                                onChangeText={handleChange('accountHolderName')}
                                onBlur={handleBlur('accountHolderName')}
                                value={values.accountHolderName}
                                errors={touched.accountHolderName && errors.accountHolderName}
                                style={styles.inputStyle}
                                submitted={submitted}

                            />



                            <InterRegular style={styles.countryLabel}>
                                Account type *
                            </InterRegular>

                            <View style={styles.dropdownContainer}>
                                <DropDownTextInput
                                    items={accountTypes}
                                    defaultValue={accountTypes[0].value}
                                    placeholder="Select Account type"
                                    onChangeValue={() => {
                                        handleChange('accountType');
                                        handleBlur('accountType')
                                        handleDropdownChange;
                                    }}
                                    style={styles.dropDown}
                                    error={touched.accountType && errors.accountType}
                                />
                            </View>

                            {/* {errors.accountType && <InterRegularSmallest style={styles.error}>
                                {errors.accountType}
                            </InterRegularSmallest>} */}

                            <InterRegular style={styles.countryLabel}>
                                Bank Name *
                            </InterRegular>

                            <View style={[styles.dropdownContainer, { zIndex: 4 }]}>
                                <DropDownTextInput
                                    items={banks}
                                    defaultValue={banks[0].value}
                                    placeholder="Select Bank Name"
                                    onChangeValue={handleDropdownChange}
                                    style={styles.dropDown}

                                />
                            </View>

                            {/* {errors.bankName && <InterRegularSmallest style={styles.error}>
                                {errors.bankName}
                            </InterRegularSmallest>} */}


                            <RegularTextInput
                                label="Account Number *"
                                placeholder="Enter Account Number"
                                placeholderTextColor={colors.inputText}
                                onChangeText={handleChange('accountNumber')}
                                onBlur={handleBlur('accountNumber')}
                                value={values.accountNumber}
                                errors={touched.accountNumber && errors.accountNumber}
                                style={styles.inputStyle}
                                submitted={submitted}

                            />

                            <RegularTextInput
                                label="Confirm Account Number *"
                                placeholder="Confirm Account Number"
                                placeholderTextColor={colors.inputText}
                                onChangeText={handleChange('confirmAccountNumber')}
                                onBlur={handleBlur('confirmAccountNumber')}
                                value={values.confirmAccountNumber}
                                errors={touched.confirmAccountNumber && errors.confirmAccountNumber}
                                style={styles.inputStyle}
                                submitted={submitted}

                            />



                            <RegularTextInput
                                label="Routing Number *"
                                placeholder="Enter Routing Number"
                                placeholderTextColor={colors.inputText}
                                onChangeText={handleChange('routingNumber')}
                                onBlur={handleBlur('routingNumber')}
                                value={values.routingNumber}
                                errors={touched.routingNumber && errors.routingNumber}
                                style={styles.inputStyle}
                                submitted={submitted}

                            />

                            <RegularTextInput
                                label="Confirm Routing Number *"
                                placeholder="Confirm Routing Number"
                                placeholderTextColor={colors.inputText}
                                onChangeText={handleChange('confirmRoutingNumber')}
                                onBlur={handleBlur('confirmRoutingNumber')}
                                value={values.confirmRoutingNumber}
                                errors={touched.confirmRoutingNumber && errors.confirmRoutingNumber}
                                style={styles.inputStyle}
                                submitted={submitted}

                            />



                            <CustomButton style={styles.submitButton} onPress={() => {

                                setSubmitted(true)
                                handleSubmit();
                            }}>
                                {title == "Edit Shop" ? "UPDATE" : "CREATE"}
                            </CustomButton>
                        </Card>


                        <GeneralModal
                            visible={shopSuccess}
                            closeModal={() => setShopSuccess(false)}
                            icon={images.checkedIcon}
                            title={title == "Edit Shop" ? "Shop Updated successfully" : 'Shop Created successfully'}
                            buttonText='Ok'
                            primaryBtn={true}
                            onPress={() => {
                                setShopSuccess(false);
                                navigation.navigate("Shop")
                            }}
                        />
                    </>
                )}
            </Formik>
        </KeyboardAwareScrollView>
    );
};

export default AddStore;
