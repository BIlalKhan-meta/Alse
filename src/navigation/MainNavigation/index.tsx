import React, { useEffect } from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AppNavigation from '../AppNavigation';
import AuthNavigation from '../AuthNavgation';
import {selectBearerToken} from '../../store/slices/authSlice';
import {useSelector} from 'react-redux';
import SubscriptionPlan from '../../screens/SubscriptionPlan';
import NavigationOptions from '../NavigationOptions';
import SearchUsers from '../../screens/SearchUsers';
import EncryptedStorage from 'react-native-encrypted-storage';
import OnboardingScreen from '../../screens/Onboarding';

const Stack = createNativeStackNavigator();
const MainNavigation = () => {
  const token = useSelector(selectBearerToken);

  const navigation = useNavigation();

  const hasSeenOnboarding = async () => {
    const hasSeen = await EncryptedStorage.getItem('hasSeenOnboarding');
    return hasSeen === 'true';
  }

  useEffect(() => {
    hasSeenOnboarding().then((hasSeen) => {
      if (!hasSeen) {
        navigation.navigate('Onboarding');
      }
    });
  }, []);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {token ? (
        <>
          <Stack.Screen name="AppNavigation" component={AppNavigation} />
          <Stack.Screen
            name="SubscriptionPlan"
            component={SubscriptionPlan}
            options={NavigationOptions}
          />
          <Stack.Screen
            name="SearchUsers"
            component={SearchUsers}
            options={NavigationOptions}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="AuthNavigation" component={AuthNavigation} />
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default MainNavigation;
