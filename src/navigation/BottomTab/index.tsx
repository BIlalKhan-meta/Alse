import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, View } from 'react-native';
import { colors } from '../../utils/theme';
import styles from './styles';
import Home from '../../screens/Home';
import HomeNavigation from '../HomeNavigation';
import { images } from '../../utils/images';
import Marketplace from '../../screens/MarketPlace';
import Game from '../../screens/Game';
import Menu from '../../screens/Menu';
import InterBold from '../../components/Text/InterBold';
import NavigationOptions from "../NavigationOptions";
import MarketPlaceNavigation from '../MarketPlaceNavigator';


const TabNavigation = () => {
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarHideOnKeyboard: true,
                tabBarStyle: styles.tabStyle,
            }}
            initialRouteName='Home'
        >
            <Tab.Screen
                name="Home"
                component={HomeNavigation}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.tabButton}>
                            <Image
                                source={images.home}
                                style={[
                                    styles.icon,
                                    { tintColor: focused ? colors.themeColor : colors.lightGrey }
                                ]}
                            />
                            <InterBold style={[
                                styles.tabButtonText,
                                { color: focused ? colors.themeColor : colors.lightGrey }
                            ]}>
                                Home
                            </InterBold>
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Marketplace"
                component={MarketPlaceNavigation}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.tabButton}>
                            <Image
                                source={images.market}
                                style={[
                                    styles.icon,
                                    { tintColor: focused ? colors.themeColor : colors.lightGrey }
                                ]}
                            />
                            <InterBold style={[
                                styles.tabButtonText,
                                { color: focused ? colors.themeColor : colors.lightGrey }
                            ]}>
                                Market Place
                            </InterBold>
                        </View>
                    ),
                    ...NavigationOptions
                }}
            />
            <Tab.Screen
                name="Game"
                component={Game}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.tabButton}>
                            <Image
                                source={images.game}
                                style={[
                                    styles.icon,
                                    { tintColor: focused ? colors.themeColor : colors.lightGrey }
                                ]}
                            />
                            <InterBold style={[
                                styles.tabButtonText,
                                { color: focused ? colors.themeColor : colors.lightGrey }
                            ]}>
                                Game
                            </InterBold>
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Menu"
                component={Menu}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={styles.tabButton}>
                            <Image
                                source={images.menu}
                                style={[
                                    styles.icon,
                                    { tintColor: focused ? colors.themeColor : colors.lightGrey }
                                ]}
                            />
                            <InterBold style={[
                                styles.tabButtonText,
                                { color: focused ? colors.themeColor : colors.lightGrey }
                            ]}>
                                Menu
                            </InterBold>
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigation;
