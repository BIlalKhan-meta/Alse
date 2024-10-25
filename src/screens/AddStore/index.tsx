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
import { createShop } from '../../api/shop';

const AddStore: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const title = route?.params?.title || "Create Shop";

    const { imageData, image, captureImage, chooseImageFromLibrary } = useImagePicker();
    const [shopSuccess, setShopSuccess] = useState(false);
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [accountType, setAccountType] = useState<string | null>(null); // State for selected account type
    const [bankName, setBankName] = useState<string | null>(null); // State for selected bank name


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



    const handleDropdownChange = (value: string | null) => {
        console.log('Selected value:', value);
    };

    const handleSubmit = async (values: object, { resetForm }: { resetForm: () => void }) => {
        console.log("SUBMITTED valuessssssss", values)
        console.log("accountType valuessssssss", accountType, bankName)
        console.log("accountType valuessssssss", imageData,)

        setSubmitted(true)
        const data = {
            name: values?.shopName,
            delivery_fees: '40',
            "bank_details[account_name]": values?.accountHolderName,
            "bank_details[account_type]": accountType,
            "bank_details[bank_name]": bankName,
            "bank_details[routing_number]": values.routingNumber,
            "bank_details[account_number]": values.accountNumber
        };
        if (imageData.type !== '') {
            // let imagePath = image.split('/');

            const uploadedImage = {
                uri: imageData?.uri,
                name: imageData?.fileName,
                type: imageData?.type,
            };

            console.log('uploadedImage= ==>', uploadedImage);
            // console.log('uploadedCover= ==>', uploadedCover);

            data['shop_banner'] = uploadedImage;
        }

        let formData = new FormData();

        Object.entries(data).forEach(item => {
            formData.append(item[0], item[1]);
        });
        console.log('formData===>', formData);


        await createShop(formData)
            // .unwrap()
            .then(res => {
                setSubmitted(false);

                console.log('response form updated createshoppppp==========>', res);
                setShopSuccess(true);
            })
            .catch(err => {
                setSubmitted(false);
                console.log('error from Updated Profile =========>', err);
            });

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
                                    onChangeValue={(value) => {
                                        setAccountType(value)
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
                                    onChangeValue={(value) => {
                                        setBankName(value)
                                        handleChange('accountType');
                                        handleBlur('accountType')
                                        handleDropdownChange;
                                    }}
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
                            }}
                            // loading={submitted}
                            >
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
