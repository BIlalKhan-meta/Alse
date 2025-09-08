import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';
import {useNavigation, useRoute} from '@react-navigation/native';
import {images} from '../../utils/images';
import useImagePicker from '../../hooks/useImagePicker';
import GeneralModal from '../../components/GeneralModal';
import {createProduct, updateProduct} from '../../api/shop';
import {getCategories, productImageDelete} from '../../api/product';
import {DialogBox} from '../../components/DialogBox';
import Toast from 'react-native-toast-message';
import Loader from '../../components/Loader';
import {
  ChevronLeft,
  Upload,
  ChevronDown,
  DollarSign,
} from 'lucide-react-native';
import {vh, vw} from '../../constant';
import {colors} from '../../utils/theme';
import CategoryDropdownComponent from '../../components/TextInput/CategoryDropdownComponent';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';

const validationSchema = yup.object().shape({
  productTitle: yup.string().required('Product title is required'),
  productDescription: yup.string().required('Product description is required'),
  price: yup.string().required('Price is required'),
  quantity: yup.string().required('Quantity is required'),
  brand_name: yup.string().required('Brand name is required'),
  sku: yup.string().required('SKU is required'),
});

const initialValues = {
  productTitle: '',
  productDescription: '',
  price: '',
  quantity: '',
  color: '',
  size: '',
  brand_name: '',
  sku: '',
};

const AddProduct: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const shopId = route?.params?.shopId;
  const item = route?.params?.item;
  const title = route?.params?.title || 'Add Product';
  const {imageData, captureImage, chooseImageFromLibrary} = useImagePicker();
  const [productSuccess, setProductSuccess] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [media, setMedia] = useState<object[]>([]);
  const [categoryId, setCategoryId] = useState();
  const [visible, setVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('COD');

  const deliveryOptions = [
    {label: 'COD', value: 'COD'},
    {label: 'Standard Delivery', value: 'standard'},
    {label: 'Express Delivery', value: 'express'},
    {label: 'Pickup', value: 'pickup'},
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const res = await getCategories();
      const fetchedCategories = res?.data?.data;

      // If API returns categories, use them, otherwise use mock data
      console.log('Fetched categories from API:', fetchedCategories);
      if (fetchedCategories && fetchedCategories.length > 0) {
        setCategories(fetchedCategories);
        setCategoryId(fetchedCategories[0].id);
        setSelectedCategory(fetchedCategories[0].title);
        console.log(
          'Using API categories, selected:',
          fetchedCategories[0].title,
        );
      } else {
        // Mock categories for testing
        const mockCategories = [
          {id: 1, title: 'Electronics'},
          {id: 2, title: 'Clothing'},
          {id: 3, title: 'Home & Garden'},
          {id: 4, title: 'Sports & Outdoors'},
          {id: 5, title: 'Books & Media'},
          {id: 6, title: 'Health & Beauty'},
          {id: 7, title: 'Toys & Games'},
          {id: 8, title: 'Automotive'},
          {id: 9, title: 'Food & Beverages'},
          {id: 10, title: 'Office Supplies'},
        ];
        setCategories(mockCategories);
        setCategoryId(mockCategories[0].id);
        setSelectedCategory(mockCategories[0].title);
        console.log(
          'Using mock categories, selected:',
          mockCategories[0].title,
        );
      }
    } catch (error) {
      console.log('Error fetching categories, using mock data:', error);
      // Fallback to mock categories if API fails
      const mockCategories = [
        {id: 1, title: 'Electronics'},
        {id: 2, title: 'Clothing'},
        {id: 3, title: 'Home & Garden'},
        {id: 4, title: 'Sports & Outdoors'},
        {id: 5, title: 'Books & Media'},
        {id: 6, title: 'Health & Beauty'},
        {id: 7, title: 'Toys & Games'},
        {id: 8, title: 'Automotive'},
        {id: 9, title: 'Food & Beverages'},
        {id: 10, title: 'Office Supplies'},
      ];
      setCategories(mockCategories);
      setCategoryId(mockCategories[0].id);
      setSelectedCategory(mockCategories[0].title);
      console.log(
        'Using fallback mock categories, selected:',
        mockCategories[0].title,
      );
    }
  };

  useEffect(() => {
    if (imageData) {
      setMedia(prevMedia => [
        ...prevMedia,
        {uri: imageData?.uri, name: imageData?.fileName, type: imageData?.type},
      ]);
      setSelectedFile(imageData?.fileName || 'Selected File');
      setVisible(false);
    }
  }, [imageData]);

  useEffect(() => {
    if (item && item.images.length != 0) {
      const arr = item.images.map(item => {
        return {uri: item.path, id: item?.id};
      });
      setMedia(prevMedia => [...prevMedia, ...arr]);
    }
  }, [item]);

  const handleDelete = async (index: number) => {
    if (media.length <= 3) {
      return Toast.show({
        type: 'error',
        text1: 'Minimum 3 Images Required',
        text2: 'Add New to Delete previous',
      });
    }
    const arr = [...media];
    let newId;
    if (arr[index]?.id) {
      newId = arr[index]?.id;
    }
    arr.splice(index, 1);
    setMedia(arr);
    await productImageDelete(item?.id, newId)
      .then(res => {})
      .catch(err => console.log('ERROR', err));
  };

  const handleSubmit = async (values: typeof initialValues) => {
    setLoading(true);
    setSubmitted(true);

    // Validate required fields
    if (
      !values.productTitle ||
      !values.productDescription ||
      !values.price ||
      !values.quantity ||
      !values.brand_name ||
      !values.sku
    ) {
      setLoading(false);
      return Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields',
      });
    }

    if (media.length < 1) {
      setLoading(false);
      return Toast.show({
        type: 'error',
        text1: 'Upload Media',
        text2: 'At least 1 image is required',
      });
    }

    if (!categoryId) {
      setLoading(false);
      return Toast.show({
        type: 'error',
        text1: 'Category Required',
        text2: 'Please select a category',
      });
    }

    try {
      // Prepare form data according to API payload
      const formData = new FormData();

      // Basic product information
      formData.append('title', values.productTitle);
      formData.append('brand_name', values.brand_name);
      formData.append('category_id', categoryId.toString());
      formData.append('sku', values.sku);
      formData.append('description', values.productDescription);
      formData.append('price', values.price);
      formData.append('quantity', values.quantity);
      // Status field - server expects 1 for active, 0 for inactive
      console.log('🔍 Status value being sent:', status, typeof status);
      formData.append('status', status ? '1' : '0');
      console.log('🔍 Status appended to FormData as:', status ? '1' : '0');

      // Add images
      media.forEach((item: any, index) => {
        if (!item?.id) {
          formData.append(`images[]`, item);
        }
      });

      // Add colors if provided
      if (values.color) {
        formData.append('colors[]', values.color);
      }

      // Add sizes if provided
      if (values.size) {
        formData.append('sizes[]', values.size);
      }

      // Add delivery option
      if (selectedDeliveryOption) {
        formData.append('delivery_option', selectedDeliveryOption);
      }

      console.log('🚀 STARTING API CALL - createProduct');
      console.log('📋 Shop ID:', shopId);
      console.log('📋 FormData created successfully');
      console.log('📋 Form data entries:');

      // Log all form data entries (React Native compatible)
      try {
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }
      } catch (e) {
        console.log('📋 FormData entries logging failed:', e);
      }

      // Debug: Log all form data values
      console.log('📊 Product data summary:', {
        title: values.productTitle,
        brand_name: values.brand_name,
        category_id: categoryId,
        sku: values.sku,
        description: values.productDescription,
        price: values.price,
        quantity: values.quantity,
        status: status,
        colors: values.color,
        sizes: values.size,
        delivery_option: selectedDeliveryOption,
        imagesCount: media.length,
      });

      if (title === 'Edit Product') {
        const response = await updateProduct(formData, shopId, item?.id);
        if (response?.data) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Product updated successfully',
          });
          navigation.navigate('ProductView', {productId: item?.id});
        }
      } else {
        console.log('📞 CALLING createProduct API...');
        console.log('📞 Endpoint: /shop/' + shopId + '/product/create');
        console.log('📞 FormData type:', typeof formData);
        console.log('📞 FormData constructor:', formData.constructor.name);
        console.log('📞 About to call createProduct function...');

        // Test network connectivity first
        console.log('🌐 Testing network connectivity...');
        try {
          const testResponse = await fetch('https://httpbin.org/get');
          console.log('🌐 Network test successful:', testResponse.status);
        } catch (networkError) {
          console.log('🌐 Network test failed:', networkError);
        }

        const response = await createProduct(formData, shopId);

        console.log('📞 createProduct function completed');
        console.log('📞 Response object:', response);
        console.log('📞 Response type:', typeof response);

        console.log('✅ API RESPONSE RECEIVED');
        console.log('✅ Response status:', response?.status);
        console.log('✅ Response data:', response?.data);

        if (response?.data) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Product created successfully',
          });
          navigation.goBack();
        } else {
          console.log('❌ No response data received');
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'No response data from server',
          });
        }
      }
    } catch (error: any) {
      console.log('Error creating/updating product:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to create product',
      });
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <View style={{width: 24}} />
      </View>

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
            <View style={styles.formContainer}>
              {/* Enter Title */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter Title"
                  placeholderTextColor="#999"
                  onChangeText={handleChange('productTitle')}
                  onBlur={handleBlur('productTitle')}
                  value={values.productTitle}
                />
                {errors.productTitle && touched.productTitle && (
                  <Text style={styles.errorText}>{errors.productTitle}</Text>
                )}
              </View>

              {/* Enter Description */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Enter Description"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  onChangeText={handleChange('productDescription')}
                  onBlur={handleBlur('productDescription')}
                  value={values.productDescription}
                />
                {errors.productDescription && touched.productDescription && (
                  <Text style={styles.errorText}>
                    {errors.productDescription}
                  </Text>
                )}
              </View>

              {/* Enter Brand Name */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter Brand Name"
                  placeholderTextColor="#999"
                  onChangeText={handleChange('brand_name')}
                  onBlur={handleBlur('brand_name')}
                  value={values.brand_name}
                />
                {errors.brand_name && touched.brand_name && (
                  <Text style={styles.errorText}>{errors.brand_name}</Text>
                )}
              </View>

              {/* Enter SKU */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter SKU"
                  placeholderTextColor="#999"
                  onChangeText={handleChange('sku')}
                  onBlur={handleBlur('sku')}
                  value={values.sku}
                />
                {errors.sku && touched.sku && (
                  <Text style={styles.errorText}>{errors.sku}</Text>
                )}
              </View>

              {/* Select Category */}
              <View style={styles.inputContainer}>
                <CategoryDropdownComponent
                  categories={categories}
                  placeholder="Select Category"
                  defaultValue={categoryId}
                  onChangeCategory={id => {
                    console.log('Category selected:', id);
                    setCategoryId(id);
                    const selectedCat = categories.find(cat => cat.id === id);
                    if (selectedCat) {
                      setSelectedCategory(selectedCat.title);
                      console.log('Selected category name:', selectedCat.title);
                    }
                  }}
                  style={styles.dropdownStyle}
                />
                {!categoryId && (
                  <Text style={styles.errorText}>Please select a category</Text>
                )}
                {/* Debug info */}
                <Text style={{fontSize: 10, color: '#666', marginTop: 4}}>
                  Categories loaded: {categories.length} | Selected:{' '}
                  {selectedCategory}
                </Text>
              </View>

              {/* Enter Price */}
              <View style={styles.inputContainer}>
                <View style={styles.priceContainer}>
                  <DollarSign size={20} color="#999" />
                  <ChevronDown size={16} color="#999" />
                  <TextInput
                    style={[styles.textInput, styles.priceInput]}
                    placeholder="Enter Price"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    onChangeText={handleChange('price')}
                    onBlur={handleBlur('price')}
                    value={values.price}
                  />
                </View>
                {errors.price && touched.price && (
                  <Text style={styles.errorText}>{errors.price}</Text>
                )}
              </View>

              {/* Enter Quantity */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter Quantity"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  onChangeText={handleChange('quantity')}
                  onBlur={handleBlur('quantity')}
                  value={values.quantity}
                />
                {errors.quantity && touched.quantity && (
                  <Text style={styles.errorText}>{errors.quantity}</Text>
                )}
              </View>

              {/* Enter Color */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter Color (optional)"
                  placeholderTextColor="#999"
                  onChangeText={handleChange('color')}
                  onBlur={handleBlur('color')}
                  value={values.color}
                />
              </View>

              {/* Enter Size */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter Size (optional)"
                  placeholderTextColor="#999"
                  onChangeText={handleChange('size')}
                  onBlur={handleBlur('size')}
                  value={values.size}
                />
              </View>

              {/* Select Delivery Option */}
              <View style={styles.inputContainer}>
                <DropDownTextInput
                  items={deliveryOptions}
                  placeholder="Select Delivery Option"
                  defaultValue={selectedDeliveryOption}
                  onChangeValue={value => setSelectedDeliveryOption(value)}
                  style={styles.dropdownStyle}
                />
              </View>

              {/* File Upload Section */}
              <View style={styles.uploadSection}>
                <TouchableOpacity
                  style={styles.uploadArea}
                  onPress={() => setVisible(true)}>
                  <Upload size={32} color="#999" />
                  <Text style={styles.uploadText}>Browse file to upload</Text>
                </TouchableOpacity>

                <View style={styles.fileStatusContainer}>
                  <Text style={styles.fileStatusText}>
                    {selectedFile || 'No Selected File'}
                  </Text>
                </View>
              </View>

              {/* Add Product Button */}
              <TouchableOpacity
                style={styles.addProductButton}
                onPress={() => {
                  console.log('🔘 ADD PRODUCT BUTTON CLICKED');
                  console.log('🔘 Form values:', values);
                  console.log('🔘 Category ID:', categoryId);
                  console.log('🔘 Media count:', media.length);
                  handleSubmit();
                }}>
                <Text style={styles.addProductButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>

      {/* Upload Modal */}
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

      {/* Success Modal */}
      <GeneralModal
        visible={productSuccess}
        closeModal={() => setProductSuccess(false)}
        icon={images.checkedIcon}
        title={
          title == 'Edit Product'
            ? 'Product Updated successfully'
            : 'Product Added successfully'
        }
        buttonText="Ok"
        primaryBtn={true}
        onPress={() => {
          setProductSuccess(false);
          navigation.goBack();
        }}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top' as const,
  },
  priceContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 0,
    marginLeft: 8,
    paddingHorizontal: 0,
  },
  dropdownContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#999',
  },
  dropdownTextSelected: {
    color: '#333',
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed' as const,
    borderRadius: 8,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  fileStatusContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fileStatusText: {
    fontSize: 16,
    color: '#333',
  },
  addProductButton: {
    backgroundColor: '#00A19D',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 20,
  },
  addProductButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
};

export default AddProduct;
