import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Formik } from 'formik';
import * as yup from 'yup';

import styles from './styles'; // Ensure you have your styles defined
import RegularTextInput from '../../components/TextInput/RegularTextInput';

import CartItem from '../../components/CartItem';

import Summary from '../../components/SummaryComponent';
import PhoneNumberInput from '../../components/TextInput/PhoneNumberInput';
import PhoneNumberInput2 from '../../components/TextInput/PhoneNumberInput2';
import { useNavigation } from '@react-navigation/native';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import BillingAddressSame from '../../components/BillingAddressSame';
import CustomButton from '../../components/CustomButton';
import { products } from '../../dummyData';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import Card from '../../components/Card';

const CheckoutScreen: React.FC = () => {
    const navigation = useNavigation();
    const [isSelected, setIsSelected] = useState<boolean>(false);

    const subTotal = products.reduce((total, product) => total + product.price * product.quantity, 0);
    const adminCommission = 5;
    const grandTotal = subTotal + adminCommission;

    const countries = [
        { label: 'Country 1', value: 'country1' },
        { label: 'Country 2', value: 'country2' },
    ];


    const states = [
        { label: 'State 1', value: 'state1' },
        { label: 'State 2', value: 'state2' },
    ];

    const cities = [
        { label: 'City 1', value: 'city1' },
        { label: 'City 2', value: 'city2' },
    ];

    const handleDropdownChange = (value: string | null) => {
        console.log('Selected value:', value);
    };


    const validationSchema = yup.object().shape({
        firstName: yup.string().required('First Name is required'),
        lastName: yup.string().required('Last Name is required'),
        email: yup.string().email('Invalid email').required('Email is required'),
        contactNo: yup.string().required('Phone Number is required'),
        shippingAddress: yup.string().required('Shipping Address is required'),
        shippingCountry: yup.string().required('Country is required'),
        shippingState: yup.string().required('State is required'),
        shippingCity: yup.string().required('City is required'),
        shippingZipCode: yup.string().required('Zip Code is required'),
        billingAddress: yup.string().required('Billing Address is required'),
        billingCountry: yup.string().required('Country is required'),
        billingState: yup.string().required('State is required'),
        billingCity: yup.string().required('City is required'),
        billingZipCode: yup.string().required('Zip Code is required'),
    });


    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        contactNo: '',
        shippingAddress: '',
        shippingCountry: countries[0].value, // Initialize with default value
        shippingState: states[0].value, // Initialize with default value
        shippingCity: cities[0].value, // Initialize with default value
        shippingZipCode: '',
        billingAddress: '',
        billingCountry: countries[0].value, // Initialize with default value
        billingState: states[0].value, // Initialize with default value
        billingCity: cities[0].value, // Initialize with default value
        billingZipCode: '',
    };

    const handleSubmit = (values: object) => {
        console.log('Form submitted:', values);
    };

    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <>
                        <Card style={styles.contentContainer}>

                            <FlatList
                                data={products}
                                renderItem={({ item, index }) => (
                                    <CartItem
                                        item={item}
                                        showQuantityControls={false}
                                        showSeparator={index !== products.length - 1}
                                        quantity={1}
                                    />
                                )}
                                keyExtractor={(item) => item.id.toString()}
                            />
                        </Card>
                        {/* Product Details and other sections as needed */}
                        <View style={styles.section}>

                            <Summary
                                subTotal={subTotal}
                                deliveryCharges={15}
                                discount={10}
                                grandTotal={grandTotal}
                                style={{ marginHorizontal: 2, }}

                            />


                        </View>
                        <Card>

                            <Text style={styles.sectionTitle}>Contact Information</Text>
                            <RegularTextInput
                                label="First Name *"
                                placeholder="Enter First Name"
                                onChangeText={handleChange('firstName')}
                                onBlur={handleBlur('firstName')}
                                value={values.firstName}
                                error={touched.firstName && errors.firstName}
                                style={styles.inputStyle}
                            />
                            {/* Add other text inputs */}
                            <RegularTextInput
                                label="Last Name *"
                                placeholder="Enter Last Name"
                                onChangeText={handleChange('lastName')}
                                onBlur={handleBlur('lastName')}
                                value={values.lastName}
                                error={touched.lastName && errors.lastName}
                                style={styles.inputStyle}

                            />
                            {/* Add other text inputs */}
                            <RegularTextInput
                                label="Email Address *"
                                placeholder="Enter Email Address"
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                value={values.email}
                                error={touched.email && errors.email}
                                style={styles.inputStyle}

                            />

                            <PhoneNumberInput2
                                initialNumber={values.contactNo}
                                onNumberChange={handleChange('contactNo')}
                                label="Contact Number *"
                                // submitted={submitted}
                                errors={errors.contactNo}
                                labelStyle={styles.label}
                                style={styles.inputStyle}
                            />

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Shipping Address</Text>

                                <RegularTextInput
                                    label="First Name *"
                                    placeholder="Enter First Name"
                                    onChangeText={handleChange('firstName')}
                                    onBlur={handleBlur('firstName')}
                                    value={values.firstName}
                                    error={touched.firstName && errors.firstName}
                                    style={styles.inputStyle}
                                />
                                <RegularTextInput
                                    label="Last Name *"
                                    placeholder="Enter Last Name"
                                    onChangeText={handleChange('lastName')}
                                    onBlur={handleBlur('lastName')}
                                    value={values.lastName}
                                    error={touched.lastName && errors.lastName}
                                    style={styles.inputStyle}

                                />

                                <PhoneNumberInput2
                                    initialNumber={values.contactNo}
                                    onNumberChange={handleChange('contactNo')}
                                    label="Contact Number *"
                                    // submitted={submitted}
                                    errors={errors.contactNo}
                                    labelStyle={styles.label}
                                    style={styles.inputStyle}
                                />


                                <RegularTextInput
                                    label="Residential Address *"
                                    placeholder="Enter Address"
                                    onChangeText={handleChange('shippingAddress')}
                                    onBlur={handleBlur('shippingAddress')}
                                    value={values.shippingAddress}
                                    error={touched.shippingAddress && errors.shippingAddress}
                                    style={styles.inputStyle}

                                />

                                <InterBoldLabel style={styles.countryLabel}>
                                    Country *
                                </InterBoldLabel>

                                <View style={styles.dropdownContainer}>
                                    <DropDownTextInput
                                        items={countries}
                                        // defaultValue='all'
                                        placeholder="Select Country"
                                        onChangeValue={handleDropdownChange}
                                        style={styles.dropDown}
                                    />
                                </View>


                                <InterBoldLabel style={styles.countryLabel}>
                                    State *
                                </InterBoldLabel>

                                <View style={[styles.dropdownContainer, { zIndex: 4 }]}>
                                    <DropDownTextInput
                                        items={states}
                                        // defaultValue='all'
                                        placeholder="Select State"
                                        onChangeValue={handleDropdownChange}
                                        style={styles.dropDown}
                                    />
                                </View>

                                <InterBoldLabel style={styles.countryLabel}>
                                    City *
                                </InterBoldLabel>

                                <View style={[styles.dropdownContainer, { zIndex: 3 }]}>
                                    <DropDownTextInput
                                        items={cities}
                                        // defaultValue='all'
                                        placeholder="Select City"
                                        onChangeValue={handleDropdownChange}
                                        style={styles.dropDown}
                                    />
                                </View>


                                <RegularTextInput
                                    label="Zip Code *"
                                    placeholder="Enter Zip Code"
                                    onChangeText={handleChange('shippingZipCode')}
                                    onBlur={handleBlur('shippingZipCode')}
                                    value={values.shippingZipCode}
                                    error={touched.shippingZipCode && errors.shippingZipCode}
                                    style={styles.inputStyle}

                                />

                            </View>


                            <BillingAddressSame
                                isSelected={isSelected}
                                setIsSelected={setIsSelected}
                            />

                            {/* Billing Address */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Billing Address</Text>

                                <RegularTextInput
                                    label="First Name *"
                                    placeholder="Enter First Name"
                                    onChangeText={handleChange('firstName')}
                                    onBlur={handleBlur('firstName')}
                                    value={values.firstName}
                                    error={touched.firstName && errors.firstName}
                                    style={styles.inputStyle}
                                />
                                <RegularTextInput
                                    label="Last Name *"
                                    placeholder="Enter Last Name"
                                    onChangeText={handleChange('lastName')}
                                    onBlur={handleBlur('lastName')}
                                    value={values.lastName}
                                    error={touched.lastName && errors.lastName}
                                    style={styles.inputStyle}

                                />

                                <PhoneNumberInput2
                                    initialNumber={values.contactNo}
                                    onNumberChange={handleChange('contactNo')}
                                    label="Contact Number *"
                                    // submitted={submitted}
                                    errors={errors.contactNo}
                                    labelStyle={styles.label}
                                    style={styles.inputStyle}
                                />


                                <RegularTextInput
                                    label="Residential Address *"
                                    placeholder="Enter Address"
                                    onChangeText={handleChange('shippingAddress')}
                                    onBlur={handleBlur('shippingAddress')}
                                    value={values.shippingAddress}
                                    error={touched.shippingAddress && errors.shippingAddress}
                                    style={styles.inputStyle}
                                />


                                <InterBoldLabel style={styles.countryLabel}>
                                    Country *
                                </InterBoldLabel>

                                <View style={styles.dropdownContainer}>
                                    <DropDownTextInput
                                        items={countries}
                                        // defaultValue='all'
                                        placeholder="Select Country"
                                        onChangeValue={handleDropdownChange}
                                        style={styles.dropDown}
                                    />
                                </View>


                                <InterBoldLabel style={styles.countryLabel}>
                                    State *
                                </InterBoldLabel>

                                <View style={[styles.dropdownContainer, { zIndex: 4 }]}>
                                    <DropDownTextInput
                                        items={states}
                                        // defaultValue='all'
                                        placeholder="Select State"
                                        onChangeValue={handleDropdownChange}
                                        style={styles.dropDown}
                                    />
                                </View>

                                <InterBoldLabel style={styles.countryLabel}>
                                    City *
                                </InterBoldLabel>

                                <View style={[styles.dropdownContainer, { zIndex: 3 }]}>
                                    <DropDownTextInput
                                        items={cities}
                                        // defaultValue='all'
                                        placeholder="Select City"
                                        onChangeValue={handleDropdownChange}
                                        style={styles.dropDown}
                                    />
                                </View>


                                <RegularTextInput
                                    label="Zip Code *"
                                    placeholder="Enter Zip Code"
                                    onChangeText={handleChange('shippingZipCode')}
                                    onBlur={handleBlur('shippingZipCode')}
                                    value={values.shippingZipCode}
                                    error={touched.shippingZipCode && errors.shippingZipCode}
                                    style={styles.inputStyle}

                                />
                            </View>

                            {/* Place Order Button */}
                            <CustomButton style={styles.placeOrderButton} onPress={() => {
                                navigation.navigate("Payment")
                                // handleSubmit()
                            }}>
                                Place Order
                            </CustomButton >

                        </Card>

                    </>
                )}
            </Formik>
        </KeyboardAwareScrollView>
    );
};

export default CheckoutScreen;
