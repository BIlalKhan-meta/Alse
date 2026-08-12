import React, {useCallback, useEffect, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {ChevronLeft, Search} from 'lucide-react-native';
import {useFocusEffect} from '@react-navigation/native';
import styles from './styles';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import {getUnreadNotificationCount} from '../../api/notifications';
import eventEmitter, {EVENT_TYPES} from '../../utils/EventEmitter';
import {syncNotificationBadgeCount} from '../../utils/notificationBadge';

interface NavigationOptionsProps {
  route: any;
  navigation: any;
}

const titles: {[key: string]: string} = {
  ChatScreen: 'Chat Screen',
  ChatOngoing: 'Group 1',
  MyPosts: 'My Post',
  CreatePost: 'Create Post',
  MediaEditor: 'Editor',
  MusicPicker: 'Add Music',
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
  Financials: 'Financials',
  Withdrawal: 'Withdrawal',
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
  Settings: 'Settings',
  PurchaseHistory: 'Purchase History',
  SavedAuctions: 'Saved Auctions',
  ShippingAddress: 'Shipping Address',
  // AddProduct: "Add Product",
  // WishList: "Wishlist",
  ContactUs: 'Contact Us',
  AboutUs: 'About Us',
  PrivacyPolicy: 'Privacy Policy',
  TermsConditions: 'Terms & Conditions',
  RequestScreen: 'RequestScreen',
  Saved: 'Saved',
  EditShop: 'Edit Shop',
  SearchUsers: 'Search User',
  Videos: 'Videos',
  ExistingSeller: 'My Stores',
  SellerAnalytics: 'Shop Analytics',
  PostDrafts: 'Drafts',
  MyCampaigns: 'My Campaigns',
  CreateCampaign: 'Create Campaign',
  CampaignStats: 'Campaign Stats',
};
const backButtonRoutes: {[key: string]: boolean} = {
  ChatOngoing: true,
  CreatePost: true,
  MediaEditor: true,
  MusicPicker: true,
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
  Blogs: true,
  AddBlog: true,
  EditBlog: true,
  SavedChatDetail: true,
  AddStore: true,
  CreatePostEdit: true,
  PostDrafts: true,
  MyShop: true,
  EditShop: true,
  AddProduct: true,
  Saved: true,
  BankDetail: true,
  AboutUs: true,
  TermsConditions: true,
  PrivacyPolicy: true,
  MyOrders: true,
  Notifications: true,
  Settings: true,
  PurchaseHistory: true,
  SavedAuctions: true,
  ShippingAddress: true,
  PaymentLogs: true,
  Financials: true,
  Withdrawal: true,
  ContactUs: true,
  RequestScreen: true,
  SearchUsers: true,
  ChatScreen: true,
  Videos: true,
  ExistingSeller: true,
  SellerAnalytics: true,
  MyCampaigns: true,
  CreateCampaign: true,
  CampaignStats: true,
};

const getTitle: React.FC<NavigationOptionsProps> = props => {
  // console.log('THIS IS GET TITLE', props?.route?.name);
  if (props?.route?.params?.screenName) {
    return props?.route?.params?.screenName;
  }

  // Special rendering for Home screen title
  if (props?.route?.name === 'Home') {
    return titles[props.route.name];
  }
  if (titles[props?.route?.name]) {
    return titles[props?.route?.name];
  }
  return '';
};

const HomeHeaderRight = ({navigation}: {navigation: any}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const applyCount = useCallback((count: number) => {
    setUnreadCount(count);
    syncNotificationBadgeCount(count).catch(() => {});
  }, []);

  const fetchUnread = useCallback(() => {
    getUnreadNotificationCount()
      .then(res => {
        const data = res?.data?.data ?? res?.data;
        const count =
          typeof data?.total === 'number'
            ? data.total
            : typeof data?.count === 'number'
              ? data.count
              : typeof data === 'number'
                ? data
                : 0;
        applyCount(count);
      })
      .catch(() => {
        applyCount(0);
      });
  }, [applyCount]);

  useFocusEffect(
    useCallback(() => {
      fetchUnread();
    }, [fetchUnread]),
  );

  useEffect(() => {
    const onBadge = (count: number) => {
      if (typeof count === 'number') {
        setUnreadCount(count);
      }
    };
    const onForegroundPush = () => {
      fetchUnread();
    };
    eventEmitter.on(EVENT_TYPES.NOTIFICATION_BADGE_UPDATED, onBadge);
    eventEmitter.on(EVENT_TYPES.FCM_FOREGROUND_RECEIVED, onForegroundPush);
    return () => {
      eventEmitter.off(EVENT_TYPES.NOTIFICATION_BADGE_UPDATED, onBadge);
      eventEmitter.off(EVENT_TYPES.FCM_FOREGROUND_RECEIVED, onForegroundPush);
    };
  }, [fetchUnread]);

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <View style={styles.notificationandshopcontainer}>
      <TouchableOpacity
        style={[styles.iconContainer, {marginRight: 4}]}
        onPress={() => navigation.navigate('Notifications')}>
        <View
          style={[
            styles.notificationcontainer,
            {
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#E4E6EB',
              width: 40,
              height: 40,
              borderRadius: 20,
            },
          ]}>
          <Image
            source={images.bellIcon}
            style={[
              styles.notificationicon,
              {tintColor: '#0C959B', width: 20, height: 20},
            ]}
          />
          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{badgeLabel}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.iconContainer, {marginRight: 4}]}
        onPress={() => navigation.navigate('SearchUsers')}
        accessibilityRole="button"
        accessibilityLabel="Search users">
        <View
          style={[
            styles.notificationcontainer,
            {
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#E4E6EB',
              width: 40,
              height: 40,
              borderRadius: 20,
            },
          ]}>
          <Search color="#0C959B" size={20} strokeWidth={2.25} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const getHeaderRight: React.FC<NavigationOptionsProps> = props => {
  if (props.route.name === 'Home') {
    return <HomeHeaderRight navigation={props.navigation} />;
  }
};

const getHeaderLeft: React.FC<NavigationOptionsProps> = props => {
  if (backButtonRoutes[props?.route?.name]) {
    if (props?.route?.name === 'ProductView') {
      return (
        <TouchableOpacity
          onPress={() => {
            props?.navigation.removeListener();
            props?.navigation?.goBack();
          }}
          style={styles.productHeaderBackButton}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ChevronLeft size={22} color={colors.black} strokeWidth={2.4} />
        </TouchableOpacity>
      );
    }

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
  console.log('THIS IS PROPS', props?.route?.name);
  const isHomeScreen = props?.route?.name === 'Home';
  const isMarketplaceScreen = props?.route?.name === 'Marketplace';
  // Hide header for Marketplace screen
  if (isMarketplaceScreen) {
    return {
      headerShown: false,
    };
  }

  return {
    headerShown: true,
    headerShadowVisible: false,
    // headerBackground: () => headerBackground(props),
    headerTitleAlign: 'left',
    headerTransparent:
      props?.route?.name === 'NearestRestaurent' ? true : false,
    headerStyle: isHomeScreen
      ? [styles.header, {backgroundColor: '#EAF6F6'}]
      : styles.header,
    headerTitleStyle: isHomeScreen ? styles.homeTitle : styles.headerTitle,
    headerBackTitleVisible: false,
    headerBackVisible: false,
    title: getTitle(props),
    headerLeft: () => getHeaderLeft(props),
    headerRight: () => getHeaderRight(props),
  };
};

export default NavigationOptions;
