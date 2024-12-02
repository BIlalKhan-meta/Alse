import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';

import styles from './styles'; // Ensure you have your styles defined
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import {useNavigation, useRoute} from '@react-navigation/native';
import {images} from '../../utils/images';
import useImagePicker from '../../hooks/useImagePicker';
import GeneralModal from '../../components/GeneralModal';
import CustomButton from '../../components/CustomButton';
import InterRegular from '../../components/Text/InterRegular';
import {createProduct, updateProduct} from '../../api/shop';
import Card from '../../components/Card';
import {getCategories, productImageDelete} from '../../api/product';
import CategoryDropdownComponent from '../../components/TextInput/CategoryDropdownComponent';
import {vh, vw} from '../../constant';
import Row from '../../components/Row';
import {DialogBox} from '../../components/DialogBox';
import Toast from 'react-native-toast-message';
import Loader from '../../components/Loader';

const AddProduct: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const shopId = route?.params?.shopId;
  const item = route?.params?.item;
  const title = route?.params?.title || 'Add Product';
  const {imageData, captureImage, chooseImageFromLibrary} = useImagePicker();
  const [productSuccess, setProductSuccess] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [status, setStatus] = useState();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [media, setMedia] = useState<object[]>([]);
  const [categoryId, setCategoryId] = useState();
  const [visible, setVisible] = useState(false);
  const [colors, setColors] = useState([]);

  const statuses = [
    {label: 'Active', value: 'active'},
    {label: 'Inactive', value: 'inactive'},
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    // setLoading(true);
    const res = await getCategories();
    const fetchedCategories = res?.data?.data;
    setCategories(fetchedCategories);

    if (fetchedCategories?.length > 0) {
      setCategoryId(fetchedCategories[0].id);
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

  useEffect(() => {
    if (item && item.images.length != 0) {
      const arr = item.images.map(item => {
        return {uri: item.path, id: item?.id};
      });
      setMedia([...media, ...arr]);
    }
  }, [item]);

  const handleDelete = async (index: number) => {
    const arr = [...media];
    let newId;
    if (arr[index]?.id) {
      newId = arr[index]?.id;
    }
    arr.splice(index, 1);
    setMedia(arr);
    await productImageDelete(item?.id, newId)
      .then(res => {})
      .catch(err => console.log('ERORRRRRRRRRRRRRRRR', err));
  };

  const validationSchema = yup.object().shape({
    productTitle: yup.string().required('Product Title is required'),
    productDescription: yup
      .string()
      .required('Product Description is required'),
    brand_name: yup.string().required('Brand Name is required'),
    price: yup
      .number()
      .required('Price is required')
      .positive('Price must be positive'),
    quantity: yup
      .number()
      .required('Quantity is required')
      .integer('Quantity must be an integer')
      .positive('Quantity must be positive'),
    color: yup.string().required('Color is required'),
    size: yup.string().required('Size is required'),
  });

  const initialValues = {
    productTitle: item?.title || '',
    productDescription: item?.description || '',
    sku: item?.sku || '',
    brand_name: item?.brand_name || '',
    price: item?.price || '',
    quantity: item?.quantity || '',
    color: item?.colors.length != 0 ? item?.colors[0].color : '',
    size: item?.sizes.length != 0 ? item?.sizes[0].size : '',
  };

  const handleDropdownChange = (value: string | null) => {
    console.log('Selected value:', value);
  };

  const handleSubmit = async (values: typeof initialValues) => {
    setLoading(true);
    setSubmitted(true);
    if (media.length < 3) {
      return Toast.show({
        type: 'error',
        text1: 'Upload Media',
        text2: 'Minimum 3 Images Required',
      });
    }
    let statusState;
    if (status == 'inactive') {
      statusState = 0;
    } else {
      statusState = 1;
    }

    const data = {
      title: values.productTitle,
      brand_name: values.brand_name,
      description: values.productDescription,
      price: values.price,
      quantity: values.quantity,
      status: statusState,
      // color: values.color,
      // size: values.size,
      category_id: categoryId,
    };

    data['colors[0]'] = values.color;
    data['sizes[0]'] = values.size;

    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      form.append(key, value);
    });

    let newIndex = 0;
    media.map((item, index) => {
      if (!item?.id) {
        form.append(`images[${newIndex}]`, item);
        newIndex = newIndex + 1;
      }
    });

    console.log(JSON.stringify(form, null, 4));

    if (title == 'Edit Product') {
      await updateProduct(form, shopId, item?.id)
        .then(res => {
          if (res?.data) {
            navigation.goBack();
          }
        })
        .catch(err => console.log('ERRRRRRRRRRRRRRRRRRR', err))
        .finally(() => setLoading(false));
    } else {
      await createProduct(form, shopId)
        .then(res => {
          if (res?.data) {
            navigation.goBack();
          }
        })
        .catch(err => console.log('ERRRRRRRRRRRRRRRRRRR', err))
        .finally(() => setLoading(false));
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
    });
  }, [navigation]);

  if (loading) {
    return <Loader />;
  }

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
          {text: 'Open Camera', onPress: () => captureImage('photo')},
          {text: 'Open Gallery', onPress: chooseImageFromLibrary},
        ]}
      />
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <Card style={styles.contentContainer}>
            <View style={styles.section}>
              <RegularTextInput
                label="Product Title *"
                placeholder="Enter Product Title"
                // placeholderTextColor={colors.darkText}
                onChangeText={handleChange('productTitle')}
                onBlur={handleBlur('productTitle')}
                value={values.productTitle}
                errors={errors.productTitle}
                style={styles.inputStyle}
                submitted={submitted}
              />
              <RegularTextInput
                label="Product Description *"
                placeholder="Enter Product Description"
                // placeholderTextColor={colors.darkText}
                onChangeText={handleChange('productDescription')}
                onBlur={handleBlur('productDescription')}
                value={values.productDescription}
                errors={errors.productDescription}
                style={styles.inputStyle}
                submitted={submitted}

                // multiline
                // numberOfLines={4}
              />

              <RegularTextInput
                label="Brand Name *"
                placeholder="Enter Brand Name"
                // placeholderTextColor={colors.darkText}
                onChangeText={handleChange('brand_name')}
                onBlur={handleBlur('brand_name')}
                value={values.brand_name}
                errors={errors.brand_name}
                style={styles.inputStyle}
                submitted={submitted}

                // multiline
                // numberOfLines={4}
              />

              <InterRegular style={styles.dropdownLabel}>Status *</InterRegular>
              <DropDownTextInput
                items={statuses}
                defaultValue="active"
                // placeholder="Select Status"
                onChangeValue={val => {
                  console.log(val, 'Val Freom drop dowwnnnn ');
                  setStatus(val);
                  handleChange('status');
                  handleBlur('status');
                  handleDropdownChange;
                }}
                style={styles.dropDown}
              />

              <InterRegular style={styles.dropdownLabel}>
                Product Image*
              </InterRegular>

              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => setVisible(true)}>
                <InterRegular style={styles.uploadTxt}>Upload</InterRegular>
                <Image source={images.upload} style={styles.uploadImg} />
              </TouchableOpacity>

              <Row justify="space-between" style={{flexWrap: 'wrap'}}>
                {media.map((item, index) => {
                  return (
                    <View
                      style={{
                        width: '48%',
                        height: vh * 15,
                        marginBottom: vh,
                      }}>
                      <Image
                        source={{uri: item?.uri}}
                        style={{
                          width: '100%',
                          height: '100%',
                          resizeMode: 'cover',
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => handleDelete(index)}
                        style={{position: 'absolute', right: vw * 2, top: vh}}>
                        <Image
                          source={images.bin}
                          style={{
                            tintColor: 'red',
                            width: vh * 2,
                            height: vh * 2,
                            resizeMode: 'contain',
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </Row>

              <RegularTextInput
                label="Price *"
                placeholder="Enter Price"
                // placeholderTextColor={colors.darkText}
                onChangeText={handleChange('price')}
                onBlur={handleBlur('price')}
                value={values.price}
                errors={errors.price}
                style={styles.inputStyle}
                keyboardType="numeric"
                submitted={submitted}
              />

              <RegularTextInput
                label="Quantity *"
                placeholder="Enter Quantity"
                // placeholderTextColor={colors.darkText}
                onChangeText={handleChange('quantity')}
                onBlur={handleBlur('quantity')}
                value={values.quantity.toString()}
                errors={errors.quantity}
                style={styles.inputStyle}
                keyboardType="numeric"
                submitted={submitted}
              />

              <InterRegular style={styles.dropdownLabel}>
                Category *
              </InterRegular>
              <CategoryDropdownComponent
                categories={categories}
                placeholder="Select Category"
                onChangeCategory={id => {
                  console.log('Selected Category ID:', id);
                  setCategoryId(id);

                  // handleChange('status');
                  // handleBlur('status')
                }}
                style={styles.dropDown}
              />

              <View style={styles.inputConatiner}>
                <View>
                  <RegularTextInput
                    label="Color *"
                    placeholder="Enter Color"
                    // placeholderTextColor={colors.darkText}
                    onChangeText={handleChange('color')}
                    onBlur={handleBlur('color')}
                    value={values.color}
                    errors={errors.color}
                    style={styles.inputStyle2}
                    submitted={submitted}
                  />
                </View>

                <View>
                  <RegularTextInput
                    label="Size *"
                    placeholder="Enter Size"
                    // placeholderTextColor={colors.darkText}
                    onChangeText={handleChange('size')}
                    onBlur={handleBlur('size')}
                    value={values.size}
                    errors={errors.size}
                    style={styles.inputStyle2}
                    keyboardType="numeric"
                    submitted={submitted}
                  />
                </View>
              </View>
            </View>

            <CustomButton
              style={styles.submitButton}
              onPress={() => {
                handleSubmit();
                // setProductSuccess(true)
              }}>
              {title == 'Edit Product' ? 'UPDATE' : 'ADD'}
            </CustomButton>

            <GeneralModal
              visible={productSuccess}
              closeModal={() => setProductSuccess(false)}
              icon={images.checkedIcon}
              title={
                title == 'Edit Product'
                  ? 'Product  Updated successfully'
                  : 'Product  Added successfully'
              }
              // message='Group has been report successfully.'
              buttonText="Ok"
              primaryBtn={true}
              onPress={() => {
                setProductSuccess(false);
                navigation.goBack();
              }}
            />
          </Card>
        )}
      </Formik>
    </KeyboardAwareScrollView>
  );
};

export default AddProduct;
