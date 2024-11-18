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
import InterRegular from '../../components/Text/InterRegular';
import Card from '../../components/Card';
import InterBoldSmall from '../../components/Text/InterBoldSmall';
import {createShop} from '../../api/shop';
import {getBank} from '../../api/menu';
import {DialogBox} from '../../components/DialogBox';
import {vh} from '../../constant';
import Toast from 'react-native-toast-message';
import Loader from '../../components/Loader';

const initialValues = {
  name: 'My New Shop',
  delivery_fees: '100',
  // shopImage: '',
  // accountHolderName: '',
  // accountType: '',
  // bankName: '',
  // routingNumber: '',
  // confirmRoutingNumber: '',
  // accountNumber: '',
  // confirmAccountNumber: '',
};

const validationSchema = yup.object().shape({
  name: yup.string().required('Shop Name is required'),
  delivery_fees: yup.string().required('Delivery Fees is required'),
  // shopImage: yup.string().required('Shop Image is required'),
  // accountHolderName: yup.string().required('Account Holder Name is required'),
  // accountType: yup.string().required('Account Type is required'),
  // bankName: yup.string().required('Bank Name is required'),
  // routingNumber: yup.string().required('Routing Number is required'),
  // confirmRoutingNumber: yup
  //   .string()
  //   .oneOf([yup.ref('routingNumber'), null], 'Routing Numbers must match')
  //   .required('Confirm Routing Number is required'),
  // accountNumber: yup.string().required('Account Number is required'),
  // confirmAccountNumber: yup
  //   .string()
  //   .oneOf([yup.ref('accountNumber'), null], 'Account Numbers must match')
  //   .required('Confirm Account Number is required'),
});

const AddStore: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const title = route?.params?.title || 'Create Shop';

  const {imageData, captureImage, chooseImageFromLibrary} = useImagePicker();
  const [shopSuccess, setShopSuccess] = useState(false);
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [bankLoader, setBankLoader] = useState(false);
  // const [accountType, setAccountType] = useState<string | null>(null); // State for selected account type
  // const [bankName, setBankName] = useState<string | null>(null); // State for selected bank name

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      title: title,
    });
  }, [navigation]);

  useEffect(() => {
    if (imageData) {
      setVisible(false);
    }
  }, [imageData]);

  // const accountTypes = [
  //   {label: 'Savings', value: 'savings'},
  //   {label: 'Checking', value: 'checking'},
  // ];

  // const banks = [
  //   {label: 'Bank 1', value: 'bank1'},
  //   {label: 'Bank 2', value: 'bank2'},
  // ];

  // const handleDropdownChange = (value: string | null) => {
  //   console.log('Selected value:', value);
  // };

  const handleShop = async (values: object) => {
    if (!imageData) {
      return Toast.show({
        type: 'error',
        text1: 'Banner',
        text2: 'Banner Required',
      });
    }
    setLoading(true);
    setSubmitted(true);
    const data = {
      name: values?.name,
      delivery_fees: values?.delivery_fees,
      // 'bank_details[account_name]': values?.accountHolderName,
      // 'bank_details[account_type]': accountType,
      // 'bank_details[bank_name]': bankName,
      // 'bank_details[routing_number]': values.routingNumber,
      // 'bank_details[account_number]': values.accountNumber,
    };
    if (imageData) {
      // let imagePath = image.split('/');

      const uploadedImage = {
        uri: imageData?.uri,
        name: imageData?.fileName,
        type: imageData?.type,
      };
      data['shop_banner'] = uploadedImage;
    }

    let formData = new FormData();

    Object.entries(data).forEach(item => {
      formData.append(item[0], item[1]);
    });
    console.log('formData===>', formData);

    await createShop(formData)
      .then(res => {
        if (res?.data) {
          setSubmitted(false);
          setShopSuccess(true);
        }
      })
      .catch(err => {
        setSubmitted(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getData = async () => {
    setBankLoader(true);
    await getBank().then(res => {
      if (!res?.data?.data) {
        setBankLoader(false);
        navigation.navigate('BankDetail');
      }
    });
  };

  useEffect(() => {
    getData();
  }, []);

  if (bankLoader) {
    return <Loader />;
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}>
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
        validationSchema={validationSchema}
        onSubmit={handleShop}>
        {({handleSubmit, handleChange, handleBlur, values, errors}) => (
          <>
            <Card style={styles.contentContainer}>
              <RegularTextInput
                label="Shop Name *"
                placeholder="Enter Shop Name"
                placeholderTextColor={colors.inputText}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
                submitted={submitted}
                errors={errors.name}
                style={styles.inputStyle}
              />
              <RegularTextInput
                label="Delivery Fees *"
                placeholder="Enter Delivery Fees"
                placeholderTextColor={colors.inputText}
                onChangeText={handleChange('delivery_fees')}
                onBlur={handleBlur('delivery_fees')}
                value={values.delivery_fees}
                submitted={submitted}
                errors={errors.delivery_fees}
                style={styles.inputStyle}
                keyboardType="numeric"
              />

              <InterRegular style={styles.dropdownLabel}>
                Banner Image*
              </InterRegular>

              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => setVisible(true)}>
                <InterRegular style={styles.uploadTxt}>Upload</InterRegular>
                <Image source={images.upload} style={styles.uploadImg} />
              </TouchableOpacity>

              <View>
                {imageData && (
                  <Image
                    source={{uri: imageData?.uri}}
                    style={{
                      width: '100%',
                      height: vh * 15,
                      resizeMode: 'cover',
                    }}
                  />
                )}
              </View>

              {/* <InterBoldSmall style={styles.heading}>
                Bank Information
              </InterBoldSmall>

              <RegularTextInput
                label="Account Holder Number *"
                placeholder="Enter account holder Name"
                placeholderTextColor={colors.inputText}
                onChangeText={handleChange('accountHolderName')}
                onBlur={handleBlur('accountHolderName')}
                value={values.accountHolderName}
                errors={errors.accountHolderName}
                style={styles.inputStyle}
                submitted={submitted}
              />

              <InterRegular style={styles.countryLabel}>
                Account type *
              </InterRegular>

              <View style={styles.dropdownContainer}>
                <DropDownTextInput
                  items={accountTypes}
                  defaultValue={accountTypes[0].value}
                  placeholder="Select Account type"
                  onChangeValue={value => {
                    setAccountType(value);
                    handleChange('accountType');
                    handleBlur('accountType');
                    handleDropdownChange;
                  }}
                  style={styles.dropDown}
                  error={errors.accountType}
                />
              </View>

              <InterRegular style={styles.countryLabel}>
                Bank Name *
              </InterRegular>

              <View style={[styles.dropdownContainer, {zIndex: 4}]}>
                <DropDownTextInput
                  items={banks}
                  defaultValue={banks[0].value}
                  placeholder="Select Bank Name"
                  onChangeValue={value => {
                    setBankName(value);
                    handleChange('accountType');
                    handleBlur('accountType');
                    handleDropdownChange;
                  }}
                  style={styles.dropDown}
                />
              </View>

              <RegularTextInput
                label="Account Number *"
                placeholder="Enter Account Number"
                placeholderTextColor={colors.inputText}
                onChangeText={handleChange('accountNumber')}
                onBlur={handleBlur('accountNumber')}
                value={values.accountNumber}
                errors={errors.accountNumber}
                style={styles.inputStyle}
                submitted={submitted}
              />

              <RegularTextInput
                label="Confirm Account Number *"
                placeholder="Confirm Account Number"
                placeholderTextColor={colors.inputText}
                onChangeText={handleChange('confirmAccountNumber')}
                onBlur={handleBlur('confirmAccountNumber')}
                value={values.confirmAccountNumber}
                errors={errors.confirmAccountNumber}
                style={styles.inputStyle}
                submitted={submitted}
              />

              <RegularTextInput
                label="Routing Number *"
                placeholder="Enter Routing Number"
                placeholderTextColor={colors.inputText}
                onChangeText={handleChange('routingNumber')}
                onBlur={handleBlur('routingNumber')}
                value={values.routingNumber}
                errors={errors.routingNumber}
                style={styles.inputStyle}
                submitted={submitted}
              />

              <RegularTextInput
                label="Confirm Routing Number *"
                placeholder="Confirm Routing Number"
                placeholderTextColor={colors.inputText}
                onChangeText={handleChange('confirmRoutingNumber')}
                onBlur={handleBlur('confirmRoutingNumber')}
                value={values.confirmRoutingNumber}
                errors={errors.confirmRoutingNumber}
                style={styles.inputStyle}
                submitted={submitted}
              />

              <CustomButton
                style={styles.submitButton}
                onPress={() => {
                  setSubmitted(true);
                  handleSubmit();
                }}>
                {title == 'Edit Shop' ? 'UPDATE' : 'CREATE'}
              </CustomButton> */}
              <CustomButton
                style={styles.submitButton}
                loading={loading}
                onPress={handleSubmit}>
                CREATE SHOP
              </CustomButton>
            </Card>

            <GeneralModal
              visible={shopSuccess}
              closeModal={() => setShopSuccess(false)}
              icon={images.checkedIcon}
              title={
                title == 'Edit Shop'
                  ? 'Shop Updated successfully'
                  : 'Shop Created successfully'
              }
              buttonText="Ok"
              primaryBtn={true}
              onPress={() => {
                setShopSuccess(false);
                navigation.goBack();
              }}
            />
          </>
        )}
      </Formik>
    </KeyboardAwareScrollView>
  );
};

export default AddStore;
