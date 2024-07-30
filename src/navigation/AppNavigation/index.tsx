
import React from "react";
import AuthNavigation from "../AuthNavgation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../../screens/Home";
import TabNavigation from "../BottomTab";
import Saved from "../../screens/Saved";
import Shop from "../../screens/Shop";
import CreatePost from "../../screens/CreatePost";
import RequestScreen from "../../screens/RequestScreen";
import BlockedUsers from "../../screens/BlockedUsers";
import Notifications from "../../screens/Notifications";
import ContactUs from "../../screens/ContactUs";
import AboutUs from "../../screens/AboutUs";
import ChatOngoing from "../../screens/ChatOngoing";
import NavigationOptions from "../NavigationOptions";
import ProductView from "../../screens/ProductView";
import MyOrderDetail from "../../screens/MyOrderDetail";
import CheckoutScreen from "../../screens/Checkout";
import BankDetailUpdate from "../../screens/BankDetailUpdate";
import BankDetail from "../../screens/BankDetail";





const AppNavigation = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="AuthNavigation"
      screenOptions={{ headerShown: false }}
    >

      <Stack.Screen name="AuthNavigation" component={AuthNavigation} />
      <Stack.Screen name="Home" component={TabNavigation} />

      <Stack.Screen name="Saved" component={Saved} />
      <Stack.Screen name="RequestScreen" component={RequestScreen} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Shop" component={Shop} options={NavigationOptions} />
      <Stack.Screen name="ProductView" component={ProductView} options={NavigationOptions} />
      <Stack.Screen name="CreatePost" component={CreatePost} options={NavigationOptions} />
      <Stack.Screen name="ContactUs" component={ContactUs} />
      <Stack.Screen name="AboutUs" component={AboutUs} />
      <Stack.Screen name="ChatOngoing" component={ChatOngoing} options={NavigationOptions} />
      <Stack.Screen name="MyOrderDetail" component={MyOrderDetail} options={NavigationOptions} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} options={NavigationOptions} />
      <Stack.Screen name="BankDetailUpdate" component={BankDetailUpdate} options={NavigationOptions} />
      <Stack.Screen name="BankDetail" component={BankDetail} options={NavigationOptions} />


    </Stack.Navigator>

  )

}

export default AppNavigation