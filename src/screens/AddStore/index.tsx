import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';
import {
  launchImageLibrary,
  launchCamera,
  Asset,
  MediaType,
  ImagePickerResponse,
} from 'react-native-image-picker';

import styles from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {ChevronLeft, Camera} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';
import {createShop} from '../../api/shop';

const initialValues = {
  name: '',
  delivery_fees: '0',
};

const imagePickerMediaOptions = {
  mediaType: 'photo' as MediaType,
  includeBase64: false,
  maxHeight: 2000,
  maxWidth: 2000,
};

const validationSchema = yup.object().shape({
  name: yup.string().trim().required('Shop name is required'),
  delivery_fees: yup
    .string()
    .trim()
    .required('Delivery fees is required')
    .matches(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (e.g. 0 or 9.99)'),
});

const AddStore: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();

  const title = route?.params?.title || 'Create your store';

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [bannerImage, setBannerImage] = useState<Asset | null>(null);
  const [avatarImage, setAvatarImage] = useState<Asset | null>(null);

  const {t} = useTranslation();

  const assignImageAsset = useCallback(
    (which: 'banner' | 'avatar', response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      const asset = response.assets?.[0];
      if (!asset) {
        return;
      }
      if (which === 'banner') {
        setBannerImage(asset);
      } else {
        setAvatarImage(asset);
      }
    },
    [],
  );

  const pickImage = useCallback(
    (which: 'banner' | 'avatar') => {
      Alert.alert('Add image', 'Choose gallery or camera.', [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Take photo',
          onPress: () =>
            launchCamera(imagePickerMediaOptions, response =>
              assignImageAsset(which, response),
            ),
        },
        {
          text: 'Photo library',
          onPress: () =>
            launchImageLibrary(imagePickerMediaOptions, response =>
              assignImageAsset(which, response),
            ),
        },
      ]);
    },
    [assignImageAsset],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#f8f8f8',
      },
      headerTitleStyle: {
        color: '#333',
        fontSize: 18,
        fontWeight: '600',
      },
      title,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title]);

  const handleStoreDetails = async (values: typeof initialValues) => {
    setSubmitted(true);
    if (!bannerImage?.uri || !avatarImage?.uri) {
      Toast.show({
        type: 'error',
        text1: 'Images required',
        text2: 'Please add both shop banner and profile image.',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('delivery_fees', values.delivery_fees.trim() || '0');
      formData.append('shop_banner', {
        uri: bannerImage.uri,
        type: bannerImage.type || 'image/jpeg',
        name: bannerImage.fileName || 'shop_banner.jpg',
      } as any);
      formData.append('shop_avatar', {
        uri: avatarImage.uri,
        type: avatarImage.type || 'image/jpeg',
        name: avatarImage.fileName || 'shop_avatar.jpg',
      } as any);

      const {data} = await createShop(formData);

      const ok =
        data?.status === true ||
        data?.success === true ||
        data?.data?.id != null ||
        data?.id != null;

      if (!ok) {
        throw new Error(data?.message || 'Failed to create shop');
      }

      const shopId =
        data?.data?.id ??
        data?.data?.shop_id ??
        data?.id ??
        data?.shop?.id;

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Shop created successfully!',
      });

      navigation.navigate('BankDetail', {
        storeData: {
          name: values.name.trim(),
          delivery_fees: values.delivery_fees.trim() || '0',
          shopId,
        },
        isNewStore: true,
      });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error?.message ??
        'Failed to create shop';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          typeof msg === 'string' ? msg : 'Failed to create shop',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPicker = (
    label: string,
    selected: Asset | null,
    hint: string,
    which: 'banner' | 'avatar',
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label} *</Text>
      <TouchableOpacity
        style={styles.imageUploadButton}
        onPress={() => pickImage(which)}
        accessibilityRole="button">
        {selected?.uri ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{uri: selected.uri}}
              style={
                which === 'banner' ? styles.imagePreview : styles.avatarPreview
              }
              resizeMode="cover"
            />
            <Text style={styles.changeImageText}>Tap to change</Text>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Camera size={24} color="#666" />
            <Text style={styles.uploadText}>{hint}</Text>
          </View>
        )}
      </TouchableOpacity>
      {submitted && !selected?.uri ? (
        <Text style={styles.errorText}>{label} is required</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleStoreDetails}>
          {({handleSubmit, handleChange, handleBlur, values, errors}) => (
            <>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('addStore.name')} *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="My shop name"
                    placeholderTextColor="#999"
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    value={values.name}
                  />
                  {submitted && errors.name ? (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('addStore.deliveryFees')} *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('addStore.deliveryFeesPlaceholder')}
                    placeholderTextColor="#999"
                    onChangeText={handleChange('delivery_fees')}
                    onBlur={handleBlur('delivery_fees')}
                    value={values.delivery_fees}
                    keyboardType="decimal-pad"
                  />
                  {submitted && errors.delivery_fees ? (
                    <Text style={styles.errorText}>{errors.delivery_fees}</Text>
                  ) : null}
                </View>

                {renderPicker(
                  t('addStore.shopBanner'),
                  bannerImage,
                  'Tap to select banner image',
                  'banner',
                )}
                {renderPicker(
                  t('addStore.shopAvatar'),
                  avatarImage,
                  'Tap to select profile photo',
                  'avatar',
                )}
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleSubmit()}
                disabled={loading}>
                <Text style={styles.submitButtonText}>
                  {loading ? 'Creating shop…' : t('addStore.submit')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddStore;
