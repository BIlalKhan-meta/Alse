import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../../screens/Home";
import ProfileScreen from "../../screens/ProfileScreen";

const HomeNavigation=()=>{
    const Stack= createNativeStackNavigator();
    return(
        <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{headerShown: false}}>
             <Stack.Screen name="Home" component={Home} />
             <Stack.Screen name="Profile" component={ProfileScreen} />
             {/* <Stack.Screen name="NearestRestaurent" component={NearestRestaurent} options={NavigationOptions}/>
             <Stack.Screen name="MenuManagement" component={MenuManagement} /> */}
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

    )

}

export default HomeNavigation