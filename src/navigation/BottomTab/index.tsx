import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Image, View} from 'react-native';
import {colors} from '../../utils/theme';
import styles from './styles';
import HomeNavigation from '../HomeNavigation';
import {images} from '../../utils/images';
import NavigationOptions from '../NavigationOptions';
import MarketPlaceNavigation from '../MarketPlaceNavigator';
import LiveStreamScreen from '../../screens/Livestream/GoLive';
import SearchTab from '../SearchTab';
import {Search} from 'lucide-react-native';
import VideosTab from '../VideosTab';
import MyProfile from '../../screens/MyProfile';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {User} from 'lucide-react-native';

const TabNavigation = () => {
  const Tab = createBottomTabNavigator();
  const user = useSelector(selectUserProfile);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabStyle,
      }}
      initialRouteName="Home">
      <Tab.Screen
        name="HomeNavigation"
        component={HomeNavigation}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabButton}>
              <Image
                source={images.home}
                style={[
                  styles.icon,
                  {tintColor: focused ? colors.themeColor : colors.lightGrey},
                ]}
              />
              {/* <InterBold
                style={[
                  styles.tabButtonText,
                  {
                    color: focused ? colors.themeColor : colors.lightGrey,
                    fontSize: fontSizes.f10,
                  },
                ]}>
                Home
              </InterBold> */}
            </View>
          ),
          ...NavigationOptions,
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchTab}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabButton}>
              {/* <Image
                source={images.menu}
                style={[
                  styles.icon,
                  {
                    tintColor: focused ? colors.themeColor : colors.lightGrey,
                  },
                ]}
              /> */}
              <Search
                style={[
                  styles.icon,
                  {
                    color: focused ? colors.themeColor : colors.lightGrey,
                  },
                ]}
              />
              {/* <InterBold
                style={[
                  styles.tabButtonText,
                  {
                    color: focused ? colors.themeColor : colors.lightGrey,
                    fontSize: fontSizes.f10,
                  },
                ]}>
                Menu
              </InterBold> */}
            </View>
          ),
          ...NavigationOptions,
        }}
      />
      <Tab.Screen
        name="MarketPlaceNavigation"
        component={MarketPlaceNavigation}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabButton}>
              <Image
                source={images.market}
                style={[
                  styles.icon,
                  {tintColor: focused ? colors.themeColor : colors.lightGrey},
                ]}
              />
              {/* <InterBold
                style={[
                  styles.tabButtonText,
                  {
                    color: focused ? colors.themeColor : colors.lightGrey,
                    fontSize: fontSizes.f10,
                  },
                ]}>
                MarketPlace
              </InterBold> */}
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
          tabBarIcon: ({focused}) => (
            <View style={styles.tabButton}>
              <Image
                source={images.liveStream}
                style={[
                  styles.icon,
                  {tintColor: focused ? colors.themeColor : colors.lightGrey},
                ]}
              />
              {/* <InterBold
                style={[
                  styles.tabButtonText,
                  {
                    color: focused ? colors.themeColor : colors.lightGrey,
                    fontSize: fontSizes.f10,
                  },
                ]}>
                Go Live
              </InterBold> */}
            </View>
          ),
          ...NavigationOptions,
        }}
      />

      <Tab.Screen
        name="Videos"
        component={VideosTab}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabButton}>
              <Image
                source={images.videoTab}
                style={[
                  styles.icon,
                  {
                    tintColor: focused ? colors.themeColor : colors.lightGrey,
                  },
                ]}
              />
              {/* <InterBold
                style={[
                  styles.tabButtonText,
                  {
                    color: focused ? colors.themeColor : colors.lightGrey,
                    fontSize: fontSizes.f10,
                  },
                ]}>
                Videos
              </InterBold> */}
            </View>
          ),
          ...NavigationOptions,
        }}
      />
      {/* TODO need to set the profile screen here directly */}
      <Tab.Screen
        name="MyProfile"
        component={MyProfile}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.tabButton}>
              {/* TODO need to place user profile picture, or icon */}
              {user?.avatar ? (
                <Image
                  source={{uri: user.avatar}}
                  style={[
                    // need this style
                    // styles.avatarImage,
                    {
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                    },
                  ]}
                />
              ) : (
                <View style={[styles.tabButton]}>
                  <User
                    // name="person"
                    color={focused ? colors.themeColor : colors.lightGrey}
                  />
                </View>
              )}
              {/* <InterBold
                style={[
                  styles.tabButtonText,
                  {
                    color: focused ? colors.themeColor : colors.lightGrey,
                    fontSize: fontSizes.f10,
                  },
                ]}>
                Menu
              </InterBold> */}
            </View>
          ),
          ...NavigationOptions,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
