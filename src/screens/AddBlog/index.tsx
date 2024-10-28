import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, Image, TouchableOpacity, ScrollView} from 'react-native';
import {Formik} from 'formik';
import * as yup from 'yup';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import styles from './styles';
import InterRegular from '../../components/Text/InterRegular';
import CustomButton from '../../components/CustomButton';
import {images} from '../../utils/images';
import {useNavigation, useRoute} from '@react-navigation/native';
import {colors} from '../../utils/theme';
import Checkbox from 'expo-checkbox';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import Card from '../../components/Card';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import useImagePicker from '../../hooks/useImagePicker';
import {DialogBox} from '../../components/DialogBox';
import Toast from 'react-native-toast-message';
import Row from '../../components/Row';
import {vh} from '../../constant';
import InterLightSmall from '../../components/Text/InterLightSmall';
import {createArticle, createBlog} from '../../api/education';

const statuses = [
  {label: 'Active', value: 'active'},
  {label: 'Inactive', value: 'inactive'},
];

const statuses1 = [
  {label: 'Information Technology', value: 'it'},
  {label: 'Artificial Intelligance', value: 'ai'},
];

const validationSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  content: yup.string().required('Description is required'),
});

const initialValues = {
  title: '',
  content: '',
};

const AddBlog = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const title = route?.params?.title || '';
  const [selected, setSelected] = useState('children');
  const [visible, setVisible] = useState(false);
  const [photos, setPhotos] = useState<object[]>([]);
  const {image, imageData, captureImage, chooseImageFromLibrary} =
    useImagePicker();
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      title: title,
    });
  }, [navigation]);

  const handleDropdownChange = (value: string | null) => {
    console.log('Selected value:', value);
  };

  const handleForm = async (data: any) => {
    if (photos.length == 0) {
      return Toast.show({
        text1: 'Upload Images',
        text2: 'Minimum 1 Image is Required',
        type: 'error',
      });
    }

    setLoading(true);
    const temp = {
      ...data,
      privacy: selected,
      ...(title == 'Add Blog' ? {blog_image: photos} : {}),
      ...(title == 'Add Article' ? {article_image: photos} : {}),
    };

    const form = new FormData();
    Object.entries(temp).map(([key, value]) => {
      form.append(key, value);
    });
    console.log('DATAAAAAAA', JSON.stringify(form, null, 4));
    if (title == 'Add Blog') {
      await createBlog(form)
        .then(res => {
          if (res?.data) {
            navigation.goBack();
          }
        })
        .catch(err => {
          console.log('ADDDDD BLOGGGG ERRRORRRRR', err);
        })
        .finally(() => {
          setLoading(false);
          navigation.goBack();
        });
    } else if (title == 'Add Article') {
      await createArticle(form)
        .then(res => {
          if (res?.data) {
            navigation.goBack();
          }
        })
        .catch(err => {
          console.log('ADDDDD Article ERRRORRRRR', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (imageData) {
      setPhotos([
        ...photos,
        {uri: imageData?.uri, name: imageData?.fileName, type: imageData?.type},
      ]);
      setVisible(false);
    }
  }, [imageData]);

  const handleDelete = (index: number) => {
    let arr = [...photos];
    arr.splice(index, 1);
    setPhotos(arr);
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      <DialogBox
        status="upload"
        heading="Upload Image"
        onClose={() => setVisible(false)}
        visible={visible}
        button={[
          {text: 'Open Camera', onPress: () => captureImage('photo')},
          {text: 'Open Gallery', onPress: chooseImageFromLibrary},
        ]}
      />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleForm}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <Card style={styles.cardStyle}>
            <RegularTextInput
              label={
                title == ('Add Blog' || 'Update Blog')
                  ? 'Blog Title *'
                  : title == 'Add Videos'
                  ? 'Title *'
                  : 'Article Title *'
              }
              placeholder="Enter Title"
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              value={values.title}
              errors={errors.title}
            />

            {(title == 'Add Videos' || title == 'Update Video') && (
              <>
                <InterRegular style={styles.dropdownLabel}>
                  Category *
                </InterRegular>
                <View style={styles.dropDownContainer}>
                  <DropDownTextInput
                    items={statuses1}
                    defaultValue="it"
                    // placeholder="Select Status"
                    onChangeValue={handleDropdownChange('status')}
                    style={[styles.dropDown, {zIndex: 1000}]}
                  />
                </View>

                <InterRegular style={styles.dropdownLabel}>
                  Status *
                </InterRegular>

                <View style={styles.dropDownContainer}>
                  <DropDownTextInput
                    items={statuses}
                    defaultValue="active"
                    // placeholder="Select Status"
                    onChangeValue={handleDropdownChange('status')}
                    style={styles.dropDown}
                  />
                </View>
              </>
            )}

            <InterRegular style={styles.imgTxt}>
              {title == 'Add Videos' ? 'Upload Video*' : 'Images *'}
            </InterRegular>

            <TouchableOpacity
              onPress={() => setVisible(true)}
              disabled={photos.length == 5}
              style={styles.uploadBtn}>
              <InterRegular style={styles.uploadTxt}>Upload</InterRegular>
              <Image source={images.upload} style={styles.uploadImg} />
            </TouchableOpacity>

            <View>
              {photos.map((item, index) => {
                return (
                  <Row justify="space-between">
                    <InterLightSmall>Image {index + 1}</InterLightSmall>
                    <TouchableOpacity onPress={() => handleDelete(index)}>
                      <Image
                        source={images.bin}
                        style={{
                          width: vh * 2,
                          height: vh * 2,
                          resizeMode: 'contain',
                        }}
                      />
                    </TouchableOpacity>
                  </Row>
                );
              })}
            </View>

            <RegularTextInput
              label="content *"
              placeholder="Enter content"
              onChangeText={handleChange('content')}
              onBlur={handleBlur('content')}
              value={values.content}
              errors={errors.content}
            />

            <View style={styles.checkboxContainer}>
              <View style={styles.checkbox}>
                <Checkbox
                  value={selected == 'children'}
                  onValueChange={() => setSelected('children')}
                />
                <InterRegular style={styles.checkboxLabel}>
                  For Children
                </InterRegular>
              </View>
              <View style={styles.checkbox}>
                <Checkbox
                  value={selected == 'adult'}
                  onValueChange={() => setSelected('adult')}
                />
                <InterRegular style={styles.checkboxLabel}>
                  For Adult
                </InterRegular>
              </View>
              <View style={styles.checkbox}>
                <Checkbox
                  value={selected == 'public'}
                  onValueChange={() => setSelected('public')}
                />
                <InterRegular style={styles.checkboxLabel}>
                  For All
                </InterRegular>
              </View>
            </View>

            <CustomButton
              loading={loading}
              style={styles.submitButton}
              onPress={handleSubmit}>
              {title == 'Add Blog' ||
              title == 'Add Article' ||
              title == 'Add Videos'
                ? 'Add'
                : 'Update'}
            </CustomButton>
          </Card>
        )}
      </Formik>
    </KeyboardAwareScrollView>
  );
};

export default AddBlog;
