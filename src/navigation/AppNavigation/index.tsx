
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





const AppNavigation = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="AuthNavigation"
      screenOptions={{ headerShown: false }}>

      <Stack.Screen name="AuthNavigation" component={AuthNavigation} />
      <Stack.Screen name="Home" component={TabNavigation} />

      <Stack.Screen name="Saved" component={Saved} />
      <Stack.Screen name="RequestScreen" component={RequestScreen} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsers} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Shop" component={Shop} />
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="ContactUs" component={ContactUs} />
      <Stack.Screen name="AboutUs" component={AboutUs} />


    </Stack.Navigator>

  )

}

export default AppNavigation