import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../../screens/Home/Feed';
import ProfileScreen from '../../screens/Menu/ProfileScreen';
import ChatScreen from '../../screens/ChatScreen';
import NavigationOptions from '../NavigationOptions';
import MyPosts from '../../screens/MyPosts';
import Cart from '../../screens/Cart';
import BlockedUsers from '../../screens/BlockedUsers';
import Marketplace from '../../screens/MarketPlace/Main';
import MyOrders from '../../screens/MyOrders';
import PaymentLogs from '../../screens/PaymentLogs';
import Financials from '../../screens/Financials';
import Withdrawal from '../../screens/Withdrawal';
import EnterDetails from '../../screens/EnterDetails';
import WithdrawalReview from '../../screens/WithdrawalReview';
import WithdrawalSuccess from '../../screens/WithdrawalSuccess';
import OrderTracking from '../../screens/OrderTracking';
import BecomeRider from '../../screens/BecomeRider';
import VerificationPending from '../../screens/VerificationPending';
import RiderDashboard from '../../screens/RiderDashboard';
import AuctionBidding from '../../screens/AuctionBidding';
import CreateAuction from '../../screens/CreateAuction';

const MarketPlaceNavigation = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="Marketplace"
      screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="Marketplace"
        component={Marketplace}
        options={NavigationOptions}
      />

      <Stack.Screen name="Cart" component={Cart} options={NavigationOptions} />
      <Stack.Screen
        name="PaymentLogs"
        component={PaymentLogs}
        options={NavigationOptions}
      />
      <Stack.Screen
        name="Financials"
        component={Financials}
        // options={NavigationOptions}
      />
      <Stack.Screen
        name="Withdrawal"
        component={Withdrawal}
        // options={NavigationOptions}
      />
      <Stack.Screen
        name="EnterDetails"
        component={EnterDetails}
        // options={NavigationOptions}
      />
      <Stack.Screen
        name="WithdrawalReview"
        component={WithdrawalReview}
        // options={NavigationOptions}
      />
      <Stack.Screen
        name="WithdrawalSuccess"
        component={WithdrawalSuccess}
        // options={NavigationOptions}
      />
      <Stack.Screen
        name="OrderTracking"
        component={OrderTracking}
        options={NavigationOptions}
      />
      <Stack.Screen
        name="BecomeRider"
        component={BecomeRider}
        // options={NavigationOptions}
      />
      <Stack.Screen
        name="VerificationPending"
        component={VerificationPending}
        // options={NavigationOptions}
      />
      <Stack.Screen
        name="RiderDashboard"
        component={RiderDashboard}
        // options={NavigationOptions}
      />
      <Stack.Screen
        name="AuctionBidding"
        component={AuctionBidding}
        // options={NavigationOptions}
      />
      <Stack.Screen
        name="CreateAuction"
        component={CreateAuction}
        // options={NavigationOptions}
      />
      {/*
       */}
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

export default MarketPlaceNavigation;
