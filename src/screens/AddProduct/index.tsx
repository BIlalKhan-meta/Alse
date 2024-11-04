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
import {colors} from '../../utils/theme';
import CustomButton from '../../components/CustomButton';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import InterRegular from '../../components/Text/InterRegular';
import {createProduct} from '../../api/shop';
import Card from '../../components/Card';
import {getCategories} from '../../api/product';
import CategoryDropdownComponent from '../../components/TextInput/CategoryDropdownComponent';
import InterLightSmall from '../../components/Text/InterLightSmall';
import {vh} from '../../constant';
import Row from '../../components/Row';

const AddProduct: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const shopId = route?.params?.shopId;
  const item = route?.params?.item;
  const title = route?.params?.title || 'Add Product';
  const {imageData, image, captureImage, chooseImageFromLibrary} =
    useImagePicker();
  const [productSuccess, setProductSuccess] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [status, setStatus] = useState();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState();

  const statuses = [
    {label: 'Active', value: 'active'},
    {label: 'Inactive', value: 'inactive'},
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    const res = await getCategories();
    const fetchedCategories = res?.data?.data;
    setCategories(fetchedCategories);

    if (fetchedCategories?.length > 0) {
      setCategoryId(fetchedCategories[0].id);
    }
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
    color: '',
    size: '',
  };

  const handleDropdownChange = (value: string | null) => {
    console.log('Selected value:', value);
  };

  const handleSubmit = async (values: typeof initialValues) => {
    setSubmitted(true);
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
      color: values.color,
      size: values.size,
      category_id: categoryId,
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
      console.log(response, 'responseeeeeee======>>>>>');
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
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
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
                onPress={() => captureImage('photo')}>
                <InterRegular style={styles.uploadTxt}>Upload</InterRegular>
                <Image source={images.upload} style={styles.uploadImg} />
              </TouchableOpacity>

              <View>
                {(imageData || item?.images.length != 0) && (
                  <Image
                    source={
                      imageData
                        ? {uri: imageData.uri}
                        : {uri: item?.images[0].path}
                    }
                    style={{
                      width: '100%',
                      height: vh * 15,
                      resizeMode: 'cover',
                    }}
                  />
                )}
              </View>

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
              {/* <DropDownTextInput
                                items={categories}
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
                            /> */}
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
                    keyboardType="numeric"
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
