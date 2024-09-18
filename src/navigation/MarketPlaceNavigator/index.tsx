import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../../screens/Home";
import ProfileScreen from "../../screens/ProfileScreen";
import ChatScreen from "../../screens/ChatScreen";
import NavigationOptions from "../NavigationOptions";
import MyPosts from "../../screens/MyPosts";
import Cart from "../../screens/Cart";
import BlockedUsers from "../../screens/BlockedUsers";
import Marketplace from "../../screens/MarketPlace";
import MyOrders from "../../screens/MyOrders";
import PaymentLogs from "../../screens/PaymentLogs";

const MarketPlaceNavigation = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator
            initialRouteName="Marketplace"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Marketplace" component={Marketplace} options={NavigationOptions} />


            <Stack.Screen name="Cart" component={Cart} options={NavigationOptions} />
            <Stack.Screen name="MyOrders" component={MyOrders} options={NavigationOptions} />
            <Stack.Screen name="PaymentLogs" component={PaymentLogs} options={NavigationOptions} />
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

    )

}

export default MarketPlaceNavigation