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

const AddStore: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const title = route?.params?.title || "Create Shop";

    const { image, captureImage, chooseImageFromLibrary } = useImagePicker();
    const [shopSuccess, setShopSuccess] = useState(false);


    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },
            title: title,

        });
    }, [navigation]);



    const categories = [
        { label: 'Category 1', value: 'category1' },
        { label: 'Category 2', value: 'category2' },
        { label: 'Category 3', value: 'category3' },
    ];

    const validationSchema = yup.object().shape({
        shopName: yup.string().required('Shop Name is required'),
        shopCategory: yup.string().required('Shop Category is required'),
        shopDescription: yup.string().required('Shop Description is required'),
        shopImage: yup.string().required('Shop Image is required'),
    });

    const initialValues = {
        shopName: '',
        shopCategory: '',
        shopDescription: '',
        shopImage: '',
    };

    const handleDropdownChange = (value: string | null) => {
        console.log('Selected value:', value);
    };

    const handleSubmit = (values: object) => {
        console.log('Form submitted:', values);
    };

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
                                label="Shop Name *"
                                placeholder="Enter Shop Name"
                                placeholderTextColor={colors.darkText}
                                onChangeText={handleChange('shopName')}
                                onBlur={handleBlur('shopName')}
                                value={values.shopName}
                                error={touched.shopName && errors.shopName}
                                style={styles.inputStyle}
                            />
                            <InterBoldLabel style={styles.dropdownLabel}>
                                Shop Category *
                            </InterBoldLabel>
                            <DropDownTextInput
                                items={categories}
                                placeholder="Select Category"
                                onChangeValue={handleDropdownChange}
                                style={styles.dropDown}
                            />
                            <RegularTextInput
                                label="Shop Description *"
                                placeholder="Enter Shop Description"
                                placeholderTextColor={colors.darkText}
                                onChangeText={handleChange('shopDescription')}
                                onBlur={handleBlur('shopDescription')}
                                value={values.shopDescription}
                                error={touched.shopDescription && errors.shopDescription}
                                style={styles.inputStyle}
                                multiline
                                numberOfLines={4}
                            />

                            <InterBoldLabel style={styles.dropdownLabel}>
                                Shop Image*
                            </InterBoldLabel>

                            <TouchableOpacity style={styles.uploadBtn}
                                onPress={() => captureImage('photo')}
                            >
                                <InterRegular style={styles.uploadTxt}>
                                    Upload
                                </InterRegular>
                                <Image source={images.upload} style={styles.uploadImg} />
                            </TouchableOpacity>
                        </View>

                        <CustomButton style={styles.submitButton} onPress={() => {
                            handleSubmit();
                            setShopSuccess(true);
                        }}>
                            {title == "Edit Shop" ? "UPDATE" : "CREATE"}
                        </CustomButton>

                        <GeneralModal
                            visible={shopSuccess}
                            closeModal={() => setShopSuccess(false)}
                            icon={images.doubleCheck}
                            title={title == "Edit Shop" ? "Shop Updated successfully" : 'Shop Created successfully'}
                            buttonText='Ok'
                            onPress={() => {
                                setShopSuccess(false);
                            }}
                        />
                    </>
                )}
            </Formik>
        </KeyboardAwareScrollView>
    );
};

export default AddStore;
