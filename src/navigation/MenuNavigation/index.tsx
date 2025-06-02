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
import Menu from '../../screens/Menu';

const MenuNavigation = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="Menu"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Menu" component={Menu} options={NavigationOptions} />
    </Stack.Navigator>
  );
};

export default MenuNavigation;
