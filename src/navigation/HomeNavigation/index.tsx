import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../../screens/Home/Feed';
import ProfileScreen from '../../screens/Menu/ProfileScreen';
import ChatScreen from '../../screens/ChatScreen';
import NavigationOptions from '../NavigationOptions';
import MyPosts from '../../screens/MyPosts';
import Cart from '../../screens/Cart';
import BlockedUsers from '../../screens/BlockedUsers';
import MyProfile from '../../screens/Menu/MyProfile';
import SubscriptionPlan from '../../screens/SubscriptionPlan';

const HomeNavigation = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={Home} options={NavigationOptions} />

      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={NavigationOptions}
      />
      <Stack.Screen
        name="MyPosts"
        component={MyPosts}
        options={NavigationOptions}
      />
      <Stack.Screen
        name="BlockedUsers"
        component={BlockedUsers}
        options={NavigationOptions}
      />
      <Stack.Screen name="Cart" component={Cart} options={NavigationOptions} />
      <Stack.Screen
        name="MyProfile"
        component={MyProfile}
        options={NavigationOptions}
      />
      {/* <Stack.Screen
        name="SubscriptionPlan"
        component={SubscriptionPlan}
        options={NavigationOptions}
      /> */}
      {/* <Stack.Screen name="MenuManagement" component={MenuManagement} /> */}
      {/*
        <Stack.Screen name="RatingsandReviews" component={RatingsandReviews} options={NavigationOptions}/> */}
      {/* <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={NavigationOptions}/> */}
      {/* <Stack.Screen name="Signup" component={Signup}/>
        <Stack.Screen name="ForgotPassword" component={ForgotPassword}/>
        <Stack.Screen name="Verification" component={Verification}/>
        <Stack.Screen name="RecoverPassword" component={RecoverPassword}/>
        <Stack.Screen name="TermsandConditions" component={TermsandConditions} options={NavigationOptions}/>
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={NavigationOptions}/> */}
    </Stack.Navigator>
  );
};

export default HomeNavigation;
