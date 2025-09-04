import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
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
import {useTranslation} from 'react-i18next';

interface Category {
  id: string;
  title: string;
}

interface MediaItem {
  uri: string;
  name: string;
  type: string;
}

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
  const title = (route?.params as any)?.title || '';
  const editItem = (route?.params as any)?.item || {};
  const [selected, setSelected] = useState('children');
  const [visible, setVisible] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const {imageData, captureImage, chooseImageFromLibrary} = useImagePicker();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const {t} = useTranslation();

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
  }, [navigation, title]);

  const handleForm = async (data: any) => {
    if (media.length == 0) {
      return Toast.show({
        text1: t('uploadImages'),
        text2: `${
          title == t('blogs.addVideos') ? t('video') : t('image')
        } is Required`,
        type: 'error',
      });
    }

    setLoading(true);
    const temp = {
      ...data,
      privacy: selected,
      ...(title == t('blogs.addBlog') ? {blog_image: media[0]} : {}),
      ...(title == t('blogs.addArticle') ? {article_image: media[0]} : {}),
      ...(title == t('blogs.addVideos') ? {video_file: media[0]} : {}),
    };

    const form = new FormData();
    Object.entries(temp).map(([key, value]) => {
      form.append(key, value);
    });
    console.log('DATAAAAAAA', JSON.stringify(form, null, 4));
    if (title == t('blogs.addBlog')) {
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
    } else if (title == t('blogs.addArticle')) {
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
              text1: t('error'),
              text2: res?.data?.message,
            });
          }
        })
        .catch(err => {
          Toast.show({
            type: 'error',
            text1: t('error'),
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
      const data = imageData as any;
      setMedia(prevMedia => [
        ...prevMedia,
        {
          uri: data?.uri || '',
          name: data?.fileName || '',
          type: data?.type || '',
        },
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
        heading={t('uploadMedia')}
        onClose={() => setVisible(false)}
        visible={visible}
        button={[
          {
            text: t('cameraUpload'),
            onPress: () =>
              captureImage(title == t('blogs.addVideos') ? 'video' : 'photo'),
          },
          {text: 'Open Gallery', onPress: chooseImageFromLibrary},
        ]}
      />
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={
          title != t('blogs.addVideos')
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
                title == (t('blogs.addBlog') || t('blogs.updateBlog'))
                  ? `${t('blogs.blogTitle')} *`
                  : title == t('blogs.addVideos')
                  ? `${t('blogs.title')} *`
                  : `${t('blogs.articleTitle')} *`
              }
              placeholder={t('enterTitle')}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              value={values.title}
              errors={errors.title as string}
            />

            {(title == t('blogs.addVideos') || title == 'Update Video') && (
              <>
                <InterRegular style={styles.dropdownLabel}>
                  {t('category')} *
                </InterRegular>
                <View style={styles.dropDownContainer}>
                  <DropDownTextInput
                    items={categories.map(item => {
                      return {label: item?.title, value: item?.id};
                    })}
                    defaultValue={values.category_id}
                    placeholder={t('selectCategory')}
                    onChangeValue={e => setValues({...values, category_id: e})}
                    style={[styles.dropDown]}
                    error={errors.category_id as string}
                  />
                </View>

                <InterRegular style={styles.dropdownLabel}>
                  {t('status')} *
                </InterRegular>

                <View style={[styles.dropDownContainer, {zIndex: 97}]}>
                  <DropDownTextInput
                    items={statuses}
                    defaultValue={values.status}
                    placeholder={t('selectStatus')}
                    onChangeValue={e => setValues({...values, status: e})}
                    style={styles.dropDown}
                    error={errors.status as string}
                  />
                </View>
              </>
            )}

            <InterRegular style={styles.imgTxt}>
              {title == t('blogs.addVideos') ? 'Upload Video*' : 'Images *'}
            </InterRegular>

            <TouchableOpacity
              onPress={() => setVisible(true)}
              disabled={media.length > 0}
              style={styles.uploadBtn}>
              <InterRegular style={styles.uploadTxt}>
                {t('upload')}
              </InterRegular>
              <Image source={images.upload} style={styles.uploadImg} />
            </TouchableOpacity>

            <View>
              {media.map((item, index) => {
                return (
                  <Row justify="space-between" style={styles.row_style}>
                    <InterLightSmall>
                      {title == t('blogs.addVideos') ? t('video') : t('image')}
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
              label={t('description')}
              placeholder={t('enterContent')}
              onChangeText={handleChange('content')}
              onBlur={handleBlur('content')}
              value={values.content}
              errors={errors.content as string}
            />

            <View style={styles.checkboxContainer}>
              <View style={styles.checkbox}>
                <Checkbox
                  value={selected == 'children'}
                  onValueChange={() => setSelected('children')}
                />
                <InterRegular style={styles.checkboxLabel}>
                  {t('blogs.forChildren')}
                </InterRegular>
              </View>
              <View style={styles.checkbox}>
                <Checkbox
                  value={selected == 'adult'}
                  onValueChange={() => setSelected('adult')}
                />
                <InterRegular style={styles.checkboxLabel}>
                  {t('blogs.forAdult')}
                </InterRegular>
              </View>
              <View style={styles.checkbox}>
                <Checkbox
                  value={selected == 'public'}
                  onValueChange={() => setSelected('public')}
                />
                <InterRegular style={styles.checkboxLabel}>
                  {t('blogs.forAll')}
                </InterRegular>
              </View>
            </View>

            <CustomButton
              loading={loading}
              style={styles.submitButton}
              onPress={handleSubmit}>
              {title == t('blogs.addBlog') ||
              title == t('blogs.addArticle') ||
              title == t('blogs.addVideos')
                ? t('add')
                : t('update')}
            </CustomButton>
          </Card>
        )}
      </Formik>
    </KeyboardAwareScrollView>
  );
};

export default AddBlog;
