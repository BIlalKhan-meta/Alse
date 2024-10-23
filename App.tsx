import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import AppNavigation from './src/navigation/AppNavigation';
import { colors } from './src/utils/theme';
import BootSplash from "react-native-bootsplash";
import { Provider } from 'react-redux';
import store, { persistor } from './src/store';
import Toast from 'react-native-toast-message';
import { PersistGate } from 'redux-persist/integration/react';
import { BacKgroundNotifListener, NotificationListener } from './src/utils/messaging.utils';
import InAppBrowser from 'react-native-inappbrowser-reborn';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
      console.log("BootSplash has been hidden successfully");
    });
  }, []);


  function handleNotification(remoteMessage: any) {
    console.log('Message handled in the !', remoteMessage?.notification);
    if (
      remoteMessage?.notification
    ) {
      InAppBrowser.close();
      // navigation.navigate("Home");
      // navigate('DrawerNavigation1');
      // RNRestart.restart();
    }
    // RNRestart.restart();
  }

  return (
    <PersistGate loading={null} persistor={persistor}>
      <Provider store={store}>
        <SafeAreaView
          style={styles.container}>
          <NotificationListener handleNotification={handleNotification} />
          <BacKgroundNotifListener handleNotification={handleNotification} />
          <NavigationContainer>
            <StatusBar backgroundColor={colors.headerColor} barStyle={'dark-content'} />
            <AppNavigation />
          </NavigationContainer>

          <Toast />

        </SafeAreaView>
      </Provider>
    </PersistGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },

});

export default App;
