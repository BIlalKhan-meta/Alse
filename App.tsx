import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {Platform, SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import AppNavigation from './src/navigation/AppNavigation';
import {colors} from './src/utils/theme';
import BootSplash from 'react-native-bootsplash';
import {Provider} from 'react-redux';
import store, {persistor} from './src/store';
import Toast from 'react-native-toast-message';
import {PersistGate} from 'redux-persist/integration/react';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {
  checkNotifications,
  PERMISSIONS,
  request,
} from 'react-native-permissions';
import {requestUserPermission} from './src/utils/NotificationServices';
import MainNavigation from './src/navigation/MainNavigation';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.headerColor,
  },
};

function App(): React.JSX.Element {
  const checkNotificationPermission = async () => {
    try {
      const res = await checkNotifications();
      if (
        res?.status == 'denied' ||
        res?.status == 'blocked' ||
        res?.status == 'unavailable' ||
        res?.status == 'limited'
      ) {
        const requestResult = await request(
          PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
        );
      }
    } catch (error) {
      console.error('Error checking notification permission:', error);
    }
  };

  useEffect(() => {
    BootSplash.hide();
    if (Platform.OS === 'android') {
      checkNotificationPermission();
    }
    requestUserPermission();
  }, []);

  function handleNotificationPress(remoteMessage: object) {
    console.log('NTOFIIIIIIIIIIIICATIONNNNNN', remoteMessage);
  }

  // function handleNotification(remoteMessage: any) {
  //   console.log('Message handled in the !', remoteMessage?.notification);
  //   if (remoteMessage?.notification) {
  //     InAppBrowser.close();
  //     // navigation.navigate("Home");
  //     // navigate('DrawerNavigation1');
  //     // RNRestart.restart();
  //   }
  //   // RNRestart.restart();
  // }

  return (
    <PersistGate loading={null} persistor={persistor}>
      <Provider store={store}>
        {/* <SafeAreaView style={styles.container}> */}

        <NavigationContainer theme={theme}>
          <MainNavigation />
        </NavigationContainer>

        <Toast />
        {/* </SafeAreaView> */}
      </Provider>
    </PersistGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default App;
