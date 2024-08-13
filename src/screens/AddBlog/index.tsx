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

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => console.log(values)}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <>
                        <RegularTextInput
                            label={title == ("Add Blog" && "Update Blog") ? "Blog Title *" : "Article Title *"}
                            placeholder="Enter Title"
                            onChangeText={handleChange('blogTitle')}
                            onBlur={handleBlur('blogTitle')}
                            value={values.blogTitle}
                            error={touched.blogTitle && errors.blogTitle}
                        />

                        <InterRegular style={styles.imgTxt}>Images *</InterRegular>


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

                        <CustomButton onPress={handleSubmit}>{title == ("Add Blog" || "Add Article") ? "Add" : "Update"}</CustomButton>
                    </>
                )}
            </Formik>
        </ScrollView>
    );
};

export default AddBlog;
