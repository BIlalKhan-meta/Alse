import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../../screens/Auth/LoginScreen';
import ForgetPassword from '../../screens/Auth/ForgetPassword';
import Verification from '../../screens/Auth/Verification';
import RecoverPassword from '../../screens/Auth/RecoverPassword';
import RegisterScreen from '../../screens/Auth/RegisterScreen';
import PrivacyPolicy from '../../screens/PrivacyPolicy';
import NavigationOptions from '../NavigationOptions';
import TermsConditions from '../../screens/TermsConditions';
import OnboardingScreen from '../../screens/Onboarding';

const AuthNavigation = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgetPassword} />
      <Stack.Screen name="Verification" component={Verification} />
      <Stack.Screen name="RecoverPassword" component={RecoverPassword} />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={NavigationOptions}
      />
      <Stack.Screen
        name="TermsConditions"
        component={TermsConditions}
        options={NavigationOptions}
      />
      <Stack.Screen
        name="Onboarding"
        component={ OnboardingScreen }
      />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
