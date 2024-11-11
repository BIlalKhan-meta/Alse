import React from 'react';
import {Image, Settings, Text, TouchableOpacity, View} from 'react-native';
// import backbuttonwhite from '../../assets/icons/backbuttonwhite.png';
// import TermsandConditions from '../../screens/TermsandConditions';
// import Notifications from '../../screens/Notifications';
// import NotificationsIcon from '../../assets/icons/notificationsicon.png'
// import BagIcon from '../../assets/icons/bagicon.png'
import styles from './styles';
import {images} from '../../utils/images';
import SavedChatDetail from '../../screens/SavedChatDetail';
import SavedScripts from '../../screens/SavedScripts';
import Home from '../../screens/Home';
import Menu from '../../screens/Menu';
import Notifications from '../../screens/Notifications';
import ContactUs from '../../screens/ContactUs';
import Saved from '../../screens/Saved';
import CreatePostEdit from '../../screens/CreatePostEdit';
import MyShop from '../../screens/MyShop';

interface RouteParams {
  screenName?: string;
  onRightIconPress?: () => void;
}

interface NavigationOptionsProps {
  route: any;
  navigation: any;
}

const titles: {[key: string]: string} = {
  ChatScreen: 'Chat',
  ChatOngoing: 'Group 1',
  MyPosts: 'My Post',
  CreatePost: 'Create Post',
  Cart: 'My Cart',
  Marketplace: 'Shops',
  Menu: 'Menu',
  Shop: 'Shop',
  MyShop: 'My Shop',
  ProductView: 'Product View',
  BlockedUsers: 'Blocked Users',
  MyOrders: 'My Orders',
  MyOrderDetail: 'My Order Detail',
  CheckoutScreen: 'Checkout',
  BankDetail: 'Bank Detail',
  BankDetailUpdate: 'Bank Detail',
  PaymentLogs: 'Payment Logs',
  // MyProfile: "Profile",
  MyProfileUpdate: 'Edit Profile',
  MyProfilePassword: 'Change Password',
  Payment: 'Payment Details',
  AddStore: 'Create Shop',
  SubscriptionPlan: 'Subscription Plan',
  SubscriptionLogs: 'Subscription Logs',
  Blogs: 'Blogs',
  SavedChat: 'Saved Chat',
  SavedChatDetail: 'Saved Chat',
  SavedScripts: 'Saved Scripts',
  Home: 'News Feed',
  Notifications: 'Notifications',
  // AddProduct: "Add Product",
  // WishList: "Wishlist",
  ContactUs: 'Contact Us',
  AboutUs: 'About Us',
  RequestScreen: 'RequestScreen',
  Saved: 'Saved',
  EditShop: 'Edit Shop',
};
const backButtonRoutes: {[key: string]: boolean} = {
  ChatOngoing: true,
  CreatePost: true,
  Shop: true,
  ProductView: true,
  MyOrderDetail: true,
  CheckoutScreen: true,
  MyProfileUpdate: true,
  MyProfilePassword: true,
  Payment: true,
  SubscriptionLogs: true,
  ViewBlog: true,
  MyBlogs: true,
  AddBlog: true,
  EditBlog: true,
  SavedChatDetail: true,
  AddStore: true,
  CreatePostEdit: true,
  MyShop: true,
  EditShop: true,
  AddProduct: true,
  Saved: true,
  BankDetail: true,
  AboutUs: true,
};

const getTitle: React.FC<NavigationOptionsProps> = props => {
  // console.log('THIS IS GET TITLE', props?.route?.name);
  if (props?.route?.params?.screenName) {
    return props?.route?.params?.screenName;
  }
  if (titles[props?.route?.name]) {
    return titles[props?.route?.name];
  }
  return '';
};

export const getHeaderRight: React.FC<NavigationOptionsProps> = props => {
  if (props.route.name === 'Home') {
    return (
      <View style={styles.notificationandshopcontainer}>
        <TouchableOpacity
          style={[styles.iconContainer, {marginRight: 4}]}
          onPress={() => props.navigation.navigate('Notifications')}>
          <View style={styles.notificationcontainer}>
            <Image source={images.bellIcon} style={styles.notificationicon} />
          </View>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.iconContainer}>
                    <View style={styles.notificationcontainer}>
                        <Image source={images.search} style={styles.notificationicon} />
                    </View>
                </TouchableOpacity> */}
      </View>
    );
  }
};
const getHeaderLeft: React.FC<NavigationOptionsProps> = props => {
  if (backButtonRoutes[props?.route?.name]) {
    // console.log("THIS ISPROPS.ROUTE.NAME", props?.route?.name);

    return (
      <TouchableOpacity
        onPress={() => {
          props?.navigation.removeListener();
          props?.navigation?.goBack();
        }}
        style={styles.headericonButton}>
        <Image
          resizeMode="contain"
          style={styles.headericonStyle}
          // source={props?.route?.name == 'NearestRestaurent' ? backbuttonwhite : BackIcon}
          source={images.backicon}
        />
      </TouchableOpacity>
    );
  } else {
    return <View></View>;
  }

  // return <></>;
};

const NavigationOptions: React.FC<NavigationOptionsProps> = props => {
  // console.log("THIS IS PROPS" , props?.route?.name);
  return {
    headerShown: true,
    headerShadowVisible: false,
    // headerBackground: () => headerBackground(props),
    headerTitleAlign: 'left',
    headerTransparent:
      props?.route?.name === 'NearestRestaurent' ? true : false,
    headerStyle: styles.header,
    headerTitleStyle: styles.headerTitle,
    headerBackTitleVisible: false,
    headerBackVisible: false,
    title: getTitle(props),
    headerLeft: () => getHeaderLeft(props),
    headerRight: () => getHeaderRight(props),
  };
};

export default NavigationOptions;
