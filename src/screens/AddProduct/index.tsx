import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
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

/** POST /shop/:id/product/create — multipart fields only */
const validationSchema = yup.object().shape({
  productTitle: yup.string().required('Product title is required'),
  productDescription: yup.string().required('Product description is required'),
  price: yup.string().required('Price is required'),
  salePrice: yup.string(),
  quantity: yup.string().required('Quantity is required'),
  sizes: yup.string(),
  colors: yup.string(),
});

const initialValues = {
  productTitle: '',
  productDescription: '',
  price: '',
  salePrice: '',
  quantity: '',
  sizes: '',
  colors: '',
};

function getCreateProductErrorMessage(error: any): string {
  if (!error) {
    return 'Failed to create product';
  }
  if (typeof error === 'string') {
    return error;
  }
  const payload = error?.response?.data ?? error?.data;
  if (payload?.message) {
    return String(payload.message);
  }
  const errors = payload?.errors ?? error?.errors;
  if (errors && typeof errors === 'object') {
    const firstVal = Object.values(errors)[0] as unknown;
    const line = Array.isArray(firstVal) ? firstVal[0] : firstVal;
    if (line != null && line !== '') {
      return String(line);
    }
  }
  if (typeof error?.message === 'string' && error.message.length > 0) {
    return error.message;
  }
  return 'Failed to create product';
}

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
    if (item) {
      // Prefill edit values via Formik enableReinitialize below is not used;
      // media is hydrated here.
      if (item.images?.length) {
        const arr = item.images.map((img: any) => {
          const isVideo = img?.type === 'video';
          return {
            uri: img.path,
            id: img?.id,
            type: isVideo ? 'video/mp4' : 'image/jpeg',
            name: isVideo ? 'video.mp4' : 'image.jpg',
            kind: isVideo ? 'video' : 'image',
          };
        });
        setMedia(arr);
      }
    }
  }, [item]);

  const handleDelete = async (index: number) => {
    if (media.length <= 1) {
      return Toast.show({
        type: 'error',
        text1: 'Keep at least 1 media item',
        text2: 'Add a new file before deleting the last one',
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

    const numericShopId = Number(shopId);
    if (shopId == null || shopId === '' || Number.isNaN(numericShopId) || numericShopId < 1) {
      setLoading(false);
      return Toast.show({
        type: 'error',
        text1: 'Missing shop',
        text2: 'Open Add Product from your shop again.',
      });
    }

    // Validate required fields
    if (
      !values.productTitle ||
      !values.productDescription ||
      !values.price ||
      !values.quantity
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

      // POST /shop/:id/product/create — only: title, category_id, description,
      // price, quantity, status, images[0..n]
      formData.append('title', String(values.productTitle));
      formData.append('category_id', String(categoryId));
      formData.append('description', String(values.productDescription));
      formData.append('price', String(values.price));
      if (values.salePrice?.trim()) {
        formData.append('sale_price', String(values.salePrice.trim()));
      }
      formData.append('quantity', String(values.quantity));
      formData.append('status', status ? '1' : '0');

      const sizeList = String(values.sizes || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      sizeList.forEach((size, idx) => {
        formData.append(`sizes[${idx}][size]`, size);
      });

      const colorList = String(values.colors || '')
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
      colorList.forEach((color, idx) => {
        formData.append(`colors[${idx}][color]`, color);
      });

      let imageUploadIndex = 0;
      media.forEach((item: any) => {
        if (!item?.id && item?.uri) {
          const isVideo =
            item?.kind === 'video' ||
            String(item?.type || '').startsWith('video');
          formData.append(`images[${imageUploadIndex}]`, {
            uri: item.uri,
            name:
              item.name ||
              (isVideo
                ? `product_${imageUploadIndex}.mp4`
                : `product_${imageUploadIndex}.jpg`),
            type: item.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          } as any);
          imageUploadIndex += 1;
        }
      });

      if (title === 'Edit Product') {
        const response = await updateProduct(
          formData,
          numericShopId,
          item?.id,
        );
        if (response?.data) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Product updated successfully',
          });
          navigation.navigate('ProductView', {productId: item?.id});
        }
      } else {
        const response = await createProduct(formData, numericShopId);

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
        text2: getCreateProductErrorMessage(error),
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
          initialValues={{
            productTitle: item?.title || '',
            productDescription: item?.description || '',
            price: item?.price != null ? String(item.price) : '',
            salePrice: item?.sale_price != null ? String(item.sale_price) : '',
            quantity: item?.quantity != null ? String(item.quantity) : '',
            sizes: Array.isArray(item?.sizes)
              ? item.sizes
                  .map((s: any) => (typeof s === 'string' ? s : s?.size))
                  .filter(Boolean)
                  .join(', ')
              : '',
            colors: Array.isArray(item?.colors)
              ? item.colors
                  .map((c: any) => (typeof c === 'string' ? c : c?.color))
                  .filter(Boolean)
                  .join(', ')
              : '',
          }}
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

              {/* Select Category */}
              <View style={styles.inputContainer}>
                <CategoryDropdownComponent
                  categories={categories}
                  placeholder="Select Category"
                  defaultValue={categoryId}
                  onChangeCategory={id => {
                    setCategoryId(id);
                  }}
                  style={styles.dropdownContainer}
                />
                {!categoryId && (
                  <Text style={styles.errorText}>Please select a category</Text>
                )}
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

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Sale price (optional)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  onChangeText={handleChange('salePrice')}
                  onBlur={handleBlur('salePrice')}
                  value={values.salePrice}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Sizes (comma separated, e.g. S, M, L)"
                  placeholderTextColor="#999"
                  onChangeText={handleChange('sizes')}
                  onBlur={handleBlur('sizes')}
                  value={values.sizes}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Colors (comma separated, e.g. Red, Blue)"
                  placeholderTextColor="#999"
                  onChangeText={handleChange('colors')}
                  onBlur={handleBlur('colors')}
                  value={values.colors}
                />
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
                onPress={() => handleSubmit()}>
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
          {text: 'Camera photo', onPress: () => captureImage('photo')},
          {text: 'Camera video', onPress: () => captureImage('video')},
          {
            text: 'Gallery (photo/video)',
            onPress: () => chooseImageFromLibrary('mixed'),
          },
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
