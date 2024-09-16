
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
import MyProfileUpdate from "../../screens/MyProfileUpdate";
import MyProfilePassword from "../../screens/MyProfilePassword";
import Payment from "../../screens/Payment";
import AddStore from "../../screens/AddStore";
import SubscriptionLogs from "../../screens/SubscriptionLogs";
import Blogs from "../../screens/Blogs";
import ViewBlog from "../../screens/BlogsDetail";
import MyBlogs from "../../screens/MyBlogs";
import AddBlog from "../../screens/AddBlog";
import SavedChat from "../../screens/SavedChat";
import SavedChatDetail from "../../screens/SavedChatDetail";
import SavedScripts from "../../screens/SavedScripts";





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
      <Stack.Screen name="MyProfileUpdate" component={MyProfileUpdate} options={NavigationOptions} />
      <Stack.Screen name="MyProfilePassword" component={MyProfilePassword} options={NavigationOptions} />
      <Stack.Screen name="Payment" component={Payment} options={NavigationOptions} />
      <Stack.Screen name="AddStore" component={AddStore} options={NavigationOptions} />
      <Stack.Screen name="SubscriptionLogs" component={SubscriptionLogs} options={NavigationOptions} />
      <Stack.Screen name="Blogs" component={Blogs} options={NavigationOptions} />
      <Stack.Screen name="ViewBlog" component={ViewBlog} options={NavigationOptions} />
      <Stack.Screen name="MyBlogs" component={MyBlogs} options={NavigationOptions} />
      <Stack.Screen name="AddBlog" component={AddBlog} options={NavigationOptions} />
      <Stack.Screen name="SavedChat" component={SavedChat} options={NavigationOptions} />
      <Stack.Screen name="SavedChatDetail" component={SavedChatDetail} options={NavigationOptions} />
      <Stack.Screen name="SavedScripts" component={SavedScripts} options={NavigationOptions} />


    </Stack.Navigator>

  )

}

export default AppNavigation