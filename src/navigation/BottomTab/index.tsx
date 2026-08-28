import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Search, User} from 'lucide-react-native';
import React from 'react';
import {Image, View} from 'react-native';
import LiveStreamScreen from '../../screens/Livestream/GoLive';
import MyProfile from '../../screens/MyProfile';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import HomeNavigation from '../HomeNavigation';
import MarketPlaceNavigation from '../MarketPlaceNavigator';
import NavigationOptions from '../NavigationOptions';
import SearchTab from '../SearchTab';
import VideosTab from '../VideosTab/Index';
import styles from './styles';

const TabNavigation = () => {
  const Tab = createBottomTabNavigator();

  // const user = useSelector(selectUserProfile);
  // console.log('user', user);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabStyle,
        tabBarActiveTintColor: colors.themeColor,
        tabBarInactiveTintColor: colors.lightGrey,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
      initialRouteName="HomeNavigation">
      <Tab.Screen
        name="HomeNavigation"
        component={HomeNavigation}
        listeners={({navigation}) => ({
          tabPress: () => {
            // After visiting Chat (or other stack screens) from Home FAB, switching
            // away and back must show the news feed, not the preserved stack top.
            navigation.navigate('HomeNavigation', {
              screen: 'Home',
            });
          },
        })}
        options={{
          tabBarLabel: 'Home',
          tabBarTestID: 'tab-home',
          tabBarIcon: ({focused, color}) => (
            <View style={styles.tabButton}>
              <Image
                source={images.home}
                style={[styles.icon, {tintColor: color}]}
              />
            </View>
          ),
          ...NavigationOptions,
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchTab}
        options={{
          tabBarLabel: 'Search',
          tabBarTestID: 'tab-search',
          tabBarIcon: ({color}) => (
            <View style={styles.tabButton}>
              <Search color={color} size={22} />
            </View>
          ),
          ...NavigationOptions,
        }}
      />
      <Tab.Screen
        name="MarketPlaceNavigation"
        component={MarketPlaceNavigation}
        options={{
          tabBarLabel: 'Market',
          tabBarTestID: 'tab-market',
          tabBarIcon: ({color}) => (
            <View style={styles.tabButton}>
              <Image
                source={images.market}
                style={[styles.icon, {tintColor: color}]}
              />
            </View>
          ),
          ...NavigationOptions,
        }}
      />
      <Tab.Screen
        name="LiveStreamScreen"
        component={LiveStreamScreen}
        initialParams={{isHost: true, channel: ''}}
        options={{
          unmountOnBlur: true,
          tabBarLabel: 'Go Live',
          tabBarIcon: ({color}) => (
            <View style={styles.tabButton}>
              <Image
                source={images.liveStream}
                style={[styles.icon, {tintColor: color}]}
              />
            </View>
          ),
          ...NavigationOptions,
        }}
      />

      <Tab.Screen
        name="Videos"
        component={VideosTab}
        options={{
          unmountOnBlur: true,
          tabBarLabel: 'Videos',
          tabBarIcon: ({color}) => (
            <View style={styles.tabButton}>
              <Image
                source={images.videoTab}
                style={[styles.icon, {tintColor: color}]}
              />
            </View>
          ),
          ...NavigationOptions,
        }}
      />
      <Tab.Screen
        name="MyProfile"
        component={MyProfile}
        options={{
          tabBarLabel: 'Profile',
          tabBarTestID: 'tab-profile',
          tabBarIcon: ({color}) => (
            <View style={styles.tabButton}>
              <User color={color} size={22} />
            </View>
          ),
          ...NavigationOptions,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
