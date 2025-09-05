import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../utils/theme';
import {vh, vw} from '../../constant';

import ShopComponent from '../../components/ShopComponent';
import RatingandReviewComponent from '../../components/RatingandReviewComponent';
import StoreOrderComponent from '../../components/StoreOrder';
import React from 'react';

interface MyStoreTopTabsNavigationProps {
  // style?: StyleProp<TextStyle>;
  style?: TextStyle;
  // onPress:()=> void;
}

const MyStoreTopTabsNavigation: React.FC<
  MyStoreTopTabsNavigationProps
> = props => {
  const Tab = createMaterialTopTabNavigator();
  const CustomTabBar = ({state, descriptors, navigation}: any) => (
    <View style={styles.tabContainer}>
      {state.routes.map((route: any, index: number) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabButton,
              {
                borderBottomColor: isFocused
                  ? colors.themeColor
                  : 'transparent',
              },
            ]}>
            <Text
              style={[
                styles.tabLabel,
                {color: isFocused ? colors.themeColor : colors.lightGrey},
              ]}>
              {label}
            </Text>
            {isFocused && (
              <View
                style={[
                  styles.activeBar,
                  {
                    width:
                      index == 0 ? vw * 20 : index == 2 ? vw * 30 : vw * 12,
                  },
                  // { width: index == 0 ? vw * 8 : vw * 20 / state.routes.length, left: index == 0 ? vw * 9 : index == 2 ? vw * 6 : vw * 2 }
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarStyle: {backgroundColor: 'white'},
      }}
      initialRouteName="Product">
      <Tab.Screen
        name="Description"
        component={StoreOrderComponent}
        initialParams={{
          type: 'description',
        }}
      />

      <Tab.Screen
        name="Rating"
        component={RatingandReviewComponent}
        initialParams={{
          type: 'rate-review',
        }}
      />

      <Tab.Screen
        name="Similar Products"
        component={ShopComponent}
        initialParams={{
          type: 'store',
        }}
      />
    </Tab.Navigator>
  );
};
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    elevation: 0,
    justifyContent: 'space-between',
    // width: vw * 98,
    // marginLeft: vw * 0.2,
    // borderRadius: 10,
    // top: vh * 10
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    // width: vw * 30,
    marginBottom: vh * 2,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  activeBar: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: colors.themeColor,
  },
});
export default MyStoreTopTabsNavigation;
