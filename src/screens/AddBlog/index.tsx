import React, { useLayoutEffect, useState } from 'react';
import { View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import styles from './styles';
import InterRegular from '../../components/Text/InterRegular';
import CustomButton from '../../components/CustomButton';
import { images } from '../../utils/images';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../utils/theme';
import Checkbox from 'expo-checkbox';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import Card from '../../components/Card';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


const statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

const statuses1 = [
    { label: 'Information Technology', value: 'it' },
    { label: 'Artificial Intelligance', value: 'ai' },
];


const AddBlog = () => {
    const navigation = useNavigation()
    const route = useRoute();
    const title = route?.params?.title || ""
    const [isChildrenSelected, setIsChildrenSelected] = useState(false);
    const [isAdultSelected, setIsAdultSelected] = useState(false);
    const [isAllSelected, setIsAllSelected] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },
            title: title,

        });
    }, [navigation]);

    const validationSchema = yup.object().shape({
        blogTitle: yup.string().required('Blog Title is required'),
        blogDescription: yup.string().required('Description is required'),
    });

    const initialValues = {
        blogTitle: '',
        blogDescription: '',
    };

    const handleDropdownChange = (value: string | null) => {
        console.log('Selected value:', value);
    };

    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => console.log(values)}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <Card style={styles.cardStyle}>


                        <RegularTextInput
                            label={title == ("Add Blog" && "Update Blog") ? "Blog Title *" : title == "Add Videos" ? "Title *" : "Article Title *"}
                            placeholder="Enter Title"
                            onChangeText={handleChange('blogTitle')}
                            onBlur={handleBlur('blogTitle')}
                            value={values.blogTitle}
                            error={touched.blogTitle && errors.blogTitle}
                        />


                        {(title == "Add Videos" || title == "Update Video") &&
                            <>

                                <InterRegular style={styles.dropdownLabel}>

                                    Category *
                                </InterRegular>
                                <View style={styles.dropDownContainer}>

                                    <DropDownTextInput
                                        items={statuses1}
                                        defaultValue='it'
                                        // placeholder="Select Status"
                                        onChangeValue={handleDropdownChange('status')}
                                        style={[styles.dropDown, { zIndex: 1000 }]}
                                    />

                                </View>

                                <InterRegular style={styles.dropdownLabel}>
                                    Status *
                                </InterRegular>

                                <View style={styles.dropDownContainer}>

                                    <DropDownTextInput
                                        items={statuses}
                                        defaultValue='active'
                                        // placeholder="Select Status"
                                        onChangeValue={handleDropdownChange('status')}
                                        style={styles.dropDown}
                                    />
                                </View>
                            </>
                        }

                        <InterRegular style={styles.imgTxt}>{title == "Add Videos" ? "Upload Video*" : "Images *"}</InterRegular>


                        <TouchableOpacity style={styles.uploadBtn}>
                            <InterRegular style={styles.uploadTxt}>Upload</InterRegular>
                            <Image source={images.upload} style={styles.uploadImg} />
                        </TouchableOpacity>

                        <RegularTextInput
                            label="Description *"
                            placeholder="Enter Description"
                            onChangeText={handleChange('blogDescription')}
                            onBlur={handleBlur('blogDescription')}
                            value={values.blogDescription}
                            error={touched.blogDescription && errors.blogDescription}
                        />

                        <View style={styles.checkboxContainer}>
                            <View style={styles.checkbox}>
                                <Checkbox
                                    value={isChildrenSelected}
                                    onValueChange={() => setIsChildrenSelected(!isChildrenSelected)}
                                />
                                <InterRegular style={styles.checkboxLabel}>For Children</InterRegular>
                            </View>
                            <View style={styles.checkbox}>
                                <Checkbox
                                    value={isAdultSelected}
                                    onValueChange={() => setIsAdultSelected(!isAdultSelected)}
                                />
                                <InterRegular style={styles.checkboxLabel}>For Adult</InterRegular>
                            </View>
                            <View style={styles.checkbox}>
                                <Checkbox
                                    value={isAllSelected}
                                    onValueChange={() => setIsAllSelected(!isAllSelected)}
                                />
                                <InterRegular style={styles.checkboxLabel}>For All</InterRegular>
                            </View>
                        </View>

                        <CustomButton containerStyle={styles.submitButton}
                            onPress={handleSubmit}>{title == ("Add Blog" || "Add Article") ? "Add" : title == "Add Videos" ? "Add" : "Update"}</CustomButton>
                    </Card>
                )}
            </Formik>
        </KeyboardAwareScrollView>
    );
};

export default AddBlog;
