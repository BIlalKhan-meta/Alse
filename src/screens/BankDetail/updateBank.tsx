import {useNavigation} from '@react-navigation/native';
import {Formik} from 'formik';
import React, {useLayoutEffect, useState} from 'react';
import {View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import * as yup from 'yup';
import {colors} from '../../utils/theme';
import InterRegular from '../../components/Text/InterRegular';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import CustomButton from '../../components/CustomButton';
import GeneralModal from '../../components/GeneralModal';
import Card from '../../components/Card';
import styles from './styles';
import {images} from '../../utils/images';
import {createBank, updateBank} from '../../api/menu';
import {createShop} from '../../api/shop';
import Toast from 'react-native-toast-message';

const accountTypes = [
  {label: 'Savings', value: 'savings'},
  {label: 'Checking', value: 'checking'},
];

const validationSchema = yup.object().shape({
  accountHolderName: yup.string().required('Account Holder Name is required'),
  accountType: yup.string().required('Account Type is required'),
  bankName: yup.string().required('Bank Name is required'),
  routingNumber: yup.string().required('Routing Number is required'),
  confirmRoutingNumber: yup
    .string()
    .oneOf([yup.ref('routingNumber')], 'Routing Numbers must match')
    .required('Confirm Routing Number is required'),
  accountNumber: yup.string().required('Account Number is required'),
  confirmAccountNumber: yup
    .string()
    .oneOf([yup.ref('accountNumber')], 'Account Numbers must match')
    .required('Confirm Account Number is required'),
});

export const UpdateBank = ({data, setData, storeData, isNewStore}) => {
  const navigation: any = useNavigation();
  const [detailUpdate, setDetailUpdate] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [storeCreated, setStoreCreated] = useState(false);

  const initialValues = {
    accountHolderName: data?.account_name || '',
    accountType: data?.account_type || accountTypes[0].value,
    bankName: data?.bank_name || '',
    routingNumber: data?.routing_number || '',
    confirmRoutingNumber: data?.routing_number || '',
    accountNumber: data?.account_number || '',
    confirmAccountNumber: data?.account_number || '',
  };

  const createStoreAfterBankDetails = async () => {
    if (!storeData) return;

    try {
      const storeFormData = new FormData();

      // Add store details
      Object.entries(storeData).forEach(([key, value]) => {
        storeFormData.append(key, value);
      });

      // Add a default delivery fee if not provided
      if (!storeData.delivery_fees) {
        storeFormData.append('delivery_fees', '0');
      }

      const response = await createShop(storeFormData);

      if (response?.status) {
        console.log('Store created successfully');
        setStoreCreated(true);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Store created successfully!',
        });
      }
    } catch (error) {
      console.log('Error creating store:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create store',
      });
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const temp = {
      account_name: values?.accountHolderName,
      account_type: values?.accountType,
      bank_name: values?.bankName,
      routing_number: values?.routingNumber,
      account_number: values?.accountNumber,
    };
    const form = new FormData();
    Object.entries(temp).forEach(([key, value]) => {
      form.append(key, value);
    });

    try {
      if (data) {
        await updateBank(form).then(res => {
          if (res?.data) {
            console.log('UPDATEEEEEEEDDDDDDDDDDDDDDDDD');
            setDetailUpdate(true);
            setLoading(false);
            setData(temp);
          }
        });
      } else {
        await createBank(form).then(res => {
          if (res?.data) {
            console.log('CREATEEEDDDDDDDDDDDDDDDDDD');
            setDetailUpdate(true);
            setLoading(false);
            setData(temp);

            // If this is a new store flow, create the store after bank details
            if (isNewStore && storeData) {
              createStoreAfterBankDetails();
            }
          }
        });
      }
    } catch (error) {
      console.log('Error in bank details submission:', error);
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      title: isNewStore ? 'Bank Details' : 'Update Bank Details',
    });
  }, [navigation, isNewStore]);

  return (
    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
      <Formik
        initialValues={initialValues}
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
          <>
            {console.log('Testttttttttttt', errors)}
            <View style={styles.container}>
              <Card style={styles.contentContainer}>
                <RegularTextInput
                  label="Account Holder Name *"
                  placeholder="Enter Name"
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('accountHolderName')}
                  onBlur={handleBlur('accountHolderName')}
                  value={values.accountHolderName}
                  errors={errors.accountHolderName}
                  style={styles.inputStyle}
                />

                <InterRegular style={styles.countryLabel}>
                  Account type
                </InterRegular>

                <View style={styles.dropdownContainer}>
                  <DropDownTextInput
                    items={accountTypes}
                    // defaultValue='all'
                    defaultValue={values?.accountType}
                    placeholder="Select"
                    onChangeValue={handleChange('accountType')}
                    style={styles.dropDown}
                  />
                </View>

                <RegularTextInput
                  label="Bank Name *"
                  placeholder="Enter Name"
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('bankName')}
                  onBlur={handleBlur('bankName')}
                  value={values.bankName}
                  errors={errors.bankName}
                  style={styles.inputStyle}
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
                  keyboardType="numeric"
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
                  keyboardType="numeric"
                />

                <RegularTextInput
                  label="Account Number *"
                  placeholder="Enter Number"
                  placeholderTextColor={colors.inputText}
                  onChangeText={handleChange('accountNumber')}
                  onBlur={handleBlur('accountNumber')}
                  value={values.accountNumber}
                  errors={errors.accountNumber}
                  style={styles.inputStyle}
                  keyboardType="numeric"
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
                  keyboardType="numeric"
                />

                <CustomButton
                  style={styles.updateButton}
                  loading={loading}
                  onPress={handleSubmit}>
                  {data ? 'UPDATE' : 'ADD'}
                </CustomButton>
              </Card>

              {/* Bank Details Success Modal */}
              <GeneralModal
                visible={detailUpdate}
                closeModal={() => setDetailUpdate(false)}
                icon={images.checkedIcon}
                title={data ? 'Bank Detail Updated' : 'Bank Detail Created'}
                message={`Bank Detail Has Been ${
                  data ? 'Update' : 'Created'
                } Successfully`}
                buttonText="OK"
                onPress={() => {
                  setDetailUpdate(false);
                  // If this is a new store flow, navigate back to marketplace
                  if (isNewStore) {
                    navigation.navigate('MarketPlaceNavigation', {
                      screen: 'Marketplace',
                    });
                  }
                }}
                primaryBtn={true}
              />

              {/* Store Creation Success Modal */}
              <GeneralModal
                visible={storeCreated}
                closeModal={() => setStoreCreated(false)}
                icon={images.checkedIcon}
                title="Store Created Successfully"
                message="Your store has been created successfully!"
                buttonText="OK"
                onPress={() => {
                  setStoreCreated(false);
                  navigation.navigate('MarketPlaceNavigation', {
                    screen: 'Marketplace',
                  });
                }}
                primaryBtn={true}
              />
            </View>
          </>
        )}
      </Formik>
    </KeyboardAwareScrollView>
  );
};
