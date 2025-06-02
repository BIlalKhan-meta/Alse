import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AppNavigation from './AppNavigation';
import AuthNavigation from './AuthNavgation';
import {selectBearerToken} from '../store/slices/authSlice';
import {useSelector} from 'react-redux';
import SubscriptionPlan from '../screens/SubscriptionPlan';
import NavigationOptions from './NavigationOptions';
import SearchUsers from '../screens/Home/SearchUsers';

const Stack = createNativeStackNavigator();
const MainNavigation = () => {
  const token = useSelector(selectBearerToken);

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
        </>
      )}
    </Stack.Navigator>
  );
};

export default MainNavigation;
