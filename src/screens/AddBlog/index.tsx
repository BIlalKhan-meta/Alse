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
import {createArticle, createBlog, createVideo} from '../../api/education';
import {getCategories} from '../../api/product';

const statuses = [
  {label: 'Active', value: '1'},
  {label: 'Inactive', value: '0'},
];

const validationSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  content: yup.string().required('Description is required'),
});

const videoSchema = yup.object().shape({
  category_id: yup.string().required('Category is required'),
  status: yup.string().required('Status is required'),
});

const AddBlog = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const title = route?.params?.title || '';
  const editItem = route?.params?.item || {};
  const [selected, setSelected] = useState('children');
  const [visible, setVisible] = useState(false);
  const [media, setMedia] = useState<object[]>([]);
  const {imageData, captureImage, chooseImageFromLibrary} = useImagePicker();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const initialValues = {
    title: editItem?.title || '',
    content: editItem?.content || '',
    category_id: editItem?.category_id || '',
    status: editItem?.status || '',
  };

  const getData = async () => {
    await getCategories().then(res => {
      if (res?.data) {
        setCategories(res?.data?.data);
      }
    });
  };

  useEffect(() => {
    getData();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      title: title,
    });
  }, [navigation]);

  const handleForm = async (data: any) => {
    if (media.length == 0) {
      return Toast.show({
        text1: 'Upload Images',
        text2: `${title == 'Add Videos' ? 'Video' : 'Image'} is Required`,
        type: 'error',
      });
    }

    setLoading(true);
    const temp = {
      ...data,
      privacy: selected,
      ...(title == 'Add Blog' ? {blog_image: media[0]} : {}),
      ...(title == 'Add Article' ? {article_image: media[0]} : {}),
      ...(title == 'Add Videos' ? {video_file: media[0]} : {}),
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
    } else {
      console.log(JSON.stringify(form, null, 4));
      await createVideo(form)
        .then(res => {
          if (res?.data?.status) {
            console.log('VIDEOOOOOOOOOOO', res?.data);
            navigation.goBack();
          } else {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: res?.data?.message,
            });
          }
        })
        .catch(err => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: err?.message,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (imageData) {
      setMedia([
        ...media,
        {uri: imageData?.uri, name: imageData?.fileName, type: imageData?.type},
      ]);
      setVisible(false);
    }
  }, [imageData]);

  const handleDelete = (index: number) => {
    let arr = [...media];
    arr.splice(index, 1);
    setMedia(arr);
  };

  console.log('CATEGGGGGGGGGGGGGGGG', categories);

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      <DialogBox
        status="upload"
        heading="Upload Media"
        onClose={() => setVisible(false)}
        visible={visible}
        button={[
          {
            text: 'Open Camera',
            onPress: () =>
              captureImage(title == 'Add Videos' ? 'video' : 'photo'),
          },
          {text: 'Open Gallery', onPress: chooseImageFromLibrary},
        ]}
      />
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={
          title != 'Add Videos'
            ? validationSchema
            : validationSchema.concat(videoSchema)
        }
        onSubmit={handleForm}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          setValues,
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
                    items={categories.map(item => {
                      return {label: item?.title, value: item?.id};
                    })}
                    defaultValue={values.category_id}
                    placeholder="Select Category"
                    onChangeValue={e => setValues({...values, category_id: e})}
                    style={[styles.dropDown]}
                    error={errors.category_id}
                  />
                </View>

                <InterRegular style={styles.dropdownLabel}>
                  Status *
                </InterRegular>

                <View style={[styles.dropDownContainer, {zIndex: 97}]}>
                  <DropDownTextInput
                    items={statuses}
                    defaultValue={values.status}
                    placeholder="Select Status"
                    onChangeValue={e => setValues({...values, status: e})}
                    style={styles.dropDown}
                    error={errors.status}
                  />
                </View>
              </>
            )}

            <InterRegular style={styles.imgTxt}>
              {title == 'Add Videos' ? 'Upload Video*' : 'Images *'}
            </InterRegular>

            <TouchableOpacity
              onPress={() => setVisible(true)}
              disabled={media.length > 0}
              style={styles.uploadBtn}>
              <InterRegular style={styles.uploadTxt}>Upload</InterRegular>
              <Image source={images.upload} style={styles.uploadImg} />
            </TouchableOpacity>

            <View>
              {media.map((item, index) => {
                return (
                  <Row justify="space-between" style={styles.row_style}>
                    <InterLightSmall>
                      {title == 'Add Videos' ? 'Video' : 'Image'}
                    </InterLightSmall>
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
              label="Description *"
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
