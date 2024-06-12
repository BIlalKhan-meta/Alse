
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../../screens/Auth/LoginScreen";
import ForgetPassword from "../../screens/Auth/ForgetPassword";
import Verification from "../../screens/Auth/Verification";
import RecoverPassword from "../../screens/Auth/RecoverPassword";
import RegisterScreen from "../../screens/Auth/RegisterScreen";


const AuthNavigation=()=>{
    const Stack= createNativeStackNavigator();
    return(
        <Stack.Navigator
        initialRouteName="RegisterScreen"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="RegisterScreen" component={RegisterScreen}/>
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="ForgotPassword" component={ForgetPassword}/>
        <Stack.Screen name="Verification" component={Verification}/>
        <Stack.Screen name="RecoverPassword" component={RecoverPassword}/>

        </Stack.Navigator>
    )

}

export default AuthNavigation