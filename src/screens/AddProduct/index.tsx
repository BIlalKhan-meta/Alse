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
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import InterRegular from '../../components/Text/InterRegular';
import { createProduct } from '../../api/shop';
import Card from '../../components/Card';

const AddProduct: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const shopId = route?.params?.shopId;
    const title = route?.params?.title || "Add Product";
    const { imageData, image, captureImage, chooseImageFromLibrary } = useImagePicker();
    const [productSuccess, setProductSuccess] = useState(false);
    const [submitted, setSubmitted] = useState<boolean>(false)
    const [status, setStatus] = useState()
    const statuses = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
    ];

    const validationSchema = yup.object().shape({
        productTitle: yup.string().required('Product Title is required'),
        productDescription: yup.string().required('Product Description is required'),
        // status: yup.string().required('Status is required'),
        // productImage: yup.string().required('Product Image is required'),
        price: yup.number().required('Price is required').positive('Price must be positive'),
        quantity: yup.number().required('Quantity is required').integer('Quantity must be an integer').positive('Quantity must be positive'),
    });

    const initialValues = {
        productTitle: '',
        productDescription: '',
        // status: statuses[0].value, // Initialize with default value
        // productImage: '',
        price: '',
        quantity: '',
    };

    const handleDropdownChange = (value: string | null) => {
        console.log('Selected value:', value);
    };


    // const handleSubmit = (values: object) => {
    //     console.log('Form submitted:', values);
    // };

    const handleSubmit = async (values: typeof initialValues) => {
        setSubmitted(true);

        console.log('====================================');
        console.log(values, "Fromm submitttt", status);
        console.log('====================================');
        let statusState;
        if (status == "inactive") {
            statusState = 0
        } else {
            statusState = 1
        }

        const data = {
            title: values.productTitle,
            // brand_name: values.brand_name,
            description: values.productDescription,
            price: values.price,
            quantity: values.quantity,
            status: statusState,
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

            data['images[0]'] = uploadedImage;
        }

        let formData = new FormData();

        Object.entries(data).forEach(item => {
            formData.append(item[0], item[1]);
        });

        try {
            const response = await createProduct(formData, shopId); // Adjust API function as needed
            console.log(response, "responseeeeeee======>>>>>")
            setSubmitted(false);
            setProductSuccess(true);
        } catch (error) {
            console.log('Error creating product:', error.response);
            setSubmitted(false);
        }
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
                    <Card style={styles.contentContainer}>

                        <View style={styles.section}>
                            <RegularTextInput
                                label="Product Title *"
                                placeholder="Enter Product Title"
                                placeholderTextColor={colors.darkText}
                                onChangeText={handleChange('productTitle')}
                                onBlur={handleBlur('productTitle')}
                                value={values.productTitle}
                                errors={touched.productTitle && errors.productTitle}
                                style={styles.inputStyle}
                                submitted={submitted}

                            />
                            <RegularTextInput
                                label="Product Description *"
                                placeholder="Enter Product Description"
                                placeholderTextColor={colors.darkText}

                                onChangeText={handleChange('productDescription')}
                                onBlur={handleBlur('productDescription')}
                                value={values.productDescription}
                                errors={touched.productDescription && errors.productDescription}
                                style={styles.inputStyle}
                                submitted={submitted}

                            // multiline
                            // numberOfLines={4}
                            />

                            <InterBoldLabel style={styles.dropdownLabel}>
                                Status *
                            </InterBoldLabel>
                            <DropDownTextInput
                                items={statuses}
                                defaultValue='active'
                                // placeholder="Select Status"
                                onChangeValue={(val) => {
                                    console.log(val, "Val Freom drop dowwnnnn ")
                                    setStatus(val)

                                    handleChange('status');
                                    handleBlur('status')
                                    handleDropdownChange
                                }}
                                style={styles.dropDown}
                            />

                            <InterBoldLabel style={styles.dropdownLabel}>
                                Product Image*
                            </InterBoldLabel>

                            <TouchableOpacity style={styles.uploadBtn}
                                onPress={() => captureImage('photo')}

                            >
                                <InterRegular style={styles.uploadTxt}>
                                    Upload
                                </InterRegular>
                                <Image source={images.upload} style={styles.uploadImg} />
                            </TouchableOpacity>

                            <RegularTextInput
                                label="Price *"
                                placeholder="Enter Price"
                                placeholderTextColor={colors.darkText}

                                onChangeText={handleChange('price')}
                                onBlur={handleBlur('price')}
                                value={values.price}
                                errors={touched.price && errors.price}
                                style={styles.inputStyle}
                                keyboardType="numeric"
                                submitted={submitted}

                            />

                            <RegularTextInput
                                label="Quantity *"
                                placeholder="Enter Quantity"
                                placeholderTextColor={colors.darkText}

                                onChangeText={handleChange('quantity')}
                                onBlur={handleBlur('quantity')}
                                value={values.quantity}
                                errors={touched.quantity && errors.quantity}
                                style={styles.inputStyle}
                                keyboardType="numeric"
                                submitted={submitted}

                            />
                        </View>

                        <CustomButton style={styles.submitButton} onPress={() => {
                            handleSubmit()
                            // setProductSuccess(true)

                        }}>
                            {title == "Edit Product" ? "UPDATE" : "ADD"}
                        </CustomButton>

                        <GeneralModal
                            visible={productSuccess}
                            closeModal={() => setProductSuccess(false)}
                            icon={images.checkedIcon}

                            title={title == "Edit Product" ? 'Product  Updated successfully' : 'Product  Added successfully'}
                            // message='Group has been report successfully.'
                            buttonText='Ok'
                            primaryBtn={true}

                            onPress={() => {
                                setProductSuccess(false)
                                navigation.goBack()
                            }}
                        />
                    </Card>
                )}
            </Formik>
        </KeyboardAwareScrollView>
    );
};

export default AddProduct;
