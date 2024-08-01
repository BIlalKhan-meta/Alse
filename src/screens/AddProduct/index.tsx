import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import * as yup from 'yup';

import styles from './styles'; // Ensure you have your styles defined
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import SignupButton from '../../components/SignupButton';
import QanelasBoldLabel from '../../components/Text/QanelasBoldLabel';
import { useNavigation, useRoute } from '@react-navigation/native';
import QanelasRegular from '../../components/Text/QanelasRegular';
import { images } from '../../utils/images';
import useImagePicker from '../../hooks/useImagePicker';
import GeneralModal from '../../components/GeneralModal';
import { colors } from '../../utils/theme';

const AddProduct: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const title = route?.params?.title || "Add Product";
    const { image, captureImage, chooseImageFromLibrary } = useImagePicker();
    const [productSuccess, setProductSuccess] = useState(false);

    const statuses = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
    ];

    const validationSchema = yup.object().shape({
        productTitle: yup.string().required('Product Title is required'),
        productDescription: yup.string().required('Product Description is required'),
        status: yup.string().required('Status is required'),
        productImage: yup.string().required('Product Image is required'),
        price: yup.number().required('Price is required').positive('Price must be positive'),
        quantity: yup.number().required('Quantity is required').integer('Quantity must be an integer').positive('Quantity must be positive'),
    });

    const initialValues = {
        productTitle: '',
        productDescription: '',
        status: statuses[0].value, // Initialize with default value
        productImage: '',
        price: '',
        quantity: '',
    };

    const handleDropdownChange = (value: string | null) => {
        console.log('Selected value:', value);
    };


    const handleSubmit = (values: object) => {
        console.log('Form submitted:', values);
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            title: title,

        });
    }, [navigation]);

    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <>
                        <View style={styles.section}>
                            <RegularTextInput
                                label="Product Title *"
                                placeholder="Enter Product Title"
                                placeholderTextColor={colors.darkText}
                                onChangeText={handleChange('productTitle')}
                                onBlur={handleBlur('productTitle')}
                                value={values.productTitle}
                                error={touched.productTitle && errors.productTitle}
                                style={styles.inputStyle}
                            />
                            <RegularTextInput
                                label="Product Description *"
                                placeholder="Enter Product Description"
                                placeholderTextColor={colors.darkText}

                                onChangeText={handleChange('productDescription')}
                                onBlur={handleBlur('productDescription')}
                                value={values.productDescription}
                                error={touched.productDescription && errors.productDescription}
                                style={styles.inputStyle}
                                // multiline
                                // numberOfLines={4}
                            />

                            <QanelasBoldLabel style={styles.dropdownLabel}>
                                Status *
                            </QanelasBoldLabel>
                            <DropDownTextInput
                                items={statuses}
                                defaultValue='active'
                                // placeholder="Select Status"
                                onChangeValue={handleDropdownChange('status')}
                                style={styles.dropDown}
                            />

                            <QanelasBoldLabel style={styles.dropdownLabel}>
                                Product Image*
                            </QanelasBoldLabel>

                            <TouchableOpacity style={styles.uploadBtn}
                                onPress={() => captureImage('photo')}

                            >
                                <QanelasRegular style={styles.uploadTxt}>
                                    Upload
                                </QanelasRegular>
                                <Image source={images.upload} style={styles.uploadImg} />
                            </TouchableOpacity>

                            <RegularTextInput
                                label="Price *"
                                placeholder="Enter Price"
                                placeholderTextColor={colors.darkText}

                                onChangeText={handleChange('price')}
                                onBlur={handleBlur('price')}
                                value={values.price}
                                error={touched.price && errors.price}
                                style={styles.inputStyle}
                                keyboardType="numeric"
                            />

                            <RegularTextInput
                                label="Quantity *"
                                placeholder="Enter Quantity"
                                placeholderTextColor={colors.darkText}

                                onChangeText={handleChange('quantity')}
                                onBlur={handleBlur('quantity')}
                                value={values.quantity}
                                error={touched.quantity && errors.quantity}
                                style={styles.inputStyle}
                                keyboardType="numeric"
                            />
                        </View>

                        <SignupButton style={styles.submitButton} onPress={() => {
                            // handleSubmit
                            setProductSuccess(true)

                        }}>
                            {title == "Edit Product" ? "UPDATE" : "ADD"}
                        </SignupButton>

                        <GeneralModal
                            visible={productSuccess}
                            closeModal={() => setProductSuccess(false)}
                            icon={images.doubleCheck}
                            title={title == "Edit Product" ? 'Product  Updated successfully' : 'Product  Added successfully'}
                            // message='Group has been report successfully.'
                            buttonText='Ok'
                            onPress={() => {
                                setProductSuccess(false)
                            }}
                        />
                    </>
                )}
            </Formik>
        </KeyboardAwareScrollView>
    );
};

export default AddProduct;
