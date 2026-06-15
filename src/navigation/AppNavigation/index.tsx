import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigation from '../BottomTab';
import Saved from '../../screens/Saved';
import Shop from '../../screens/MarketPlace/Shop';
import CreatePost from '../../screens/CreatePost';
import ImageCrop from '../../screens/ImageCrop';
import MediaEditor from '../../screens/MediaEditor';
import MusicPicker from '../../screens/MusicPicker';
import RequestScreen from '../../screens/RequestScreen';
import Notifications from '../../screens/Home/Notifications';
import ContactUs from '../../screens/ContactUs';
import AboutUs from '../../screens/AboutUs';
import ChatOngoing from '../../screens/ChatOngoing';
import NavigationOptions from '../NavigationOptions';
import ProductView from '../../screens/MarketPlace/ProductView';
import ProductDetail from '../../screens/ProductDetail';
import MyOrderDetail from '../../screens/MyOrderDetail';
import CheckoutScreen from '../../screens/Checkout';
import BankDetailUpdate from '../../screens/BankDetailUpdate';
import BankDetail from '../../screens/BankDetail';
import MyProfileUpdate from '../../screens/MyProfileUpdate';
import MyProfilePassword from '../../screens/MyProfilePassword';
import Payment from '../../screens/Payment';
import AddStore from '../../screens/AddStore';
import SubscriptionLogs from '../../screens/SubscriptionLogs';
import Blogs from '../../screens/Blogs';
import ViewBlog from '../../screens/BlogsDetail';
import MyBlogs from '../../screens/MyBlogs';
import AddBlog from '../../screens/AddBlog';
import SavedChat from '../../screens/SavedChat';
import SavedChatDetail from '../../screens/SavedChatDetail';
import SavedScripts from '../../screens/SavedScripts';
import CreatePostEdit from '../../screens/CreatePostEdit';
import AddProduct from '../../screens/AddProduct';
import MyShop from '../../screens/MyShop';
import EditBlog from '../../screens/EditBlog';
import {EditShop} from '../../screens/MarketPlace/EditShop';
import MyOrders from '../../screens/MyOrders';
import ProfileScreen from '../../screens/Menu/ProfileScreen';
import AddStory from '../../screens/AddStory';
import AcknowledgeCall from '../../screens/AcknowledgeCall';
import VideoCall from '../../screens/VideoCall';
import AudioCall from '../../screens/AudioCall';
import NetworkLogger from 'react-native-network-logger';
import Groups from '../../screens/Groups';
import GroupDetailsScreen from '../../screens/Groups/GroupDetailsScreen';
import CreateGroup from '../../screens/Groups/CreateGroup';
import Settings from '../../screens/Settings/index';
import LanguageSelection from '../../screens/Settings/LanguageSelection';
import VideosTab from '../VideosTab/Index';
import SocialActivity from '../../screens/Settings/SocialActivity';
import BiddingAuctionSetting from '../../screens/Settings/Bidding&Auction';
import MarketplaceActivity from '../../screens/Settings/MarketplaceActivity';
import NotificationSettings from '../../screens/Settings/NotificationSettings';
import SecurityPrivacy from '../../screens/Settings/Security&Privacy';
import ChangePassword from '../../screens/Settings/ChangePassword';
import DisableDeleteAccount from '../../screens/Settings/DisableDeleteAccount';
import PurchaseHistory from '../../screens/Settings/PurchaseHistory';
import SavedAuctions from '../../screens/Settings/SavedAuctions';
import ShippingAddress from '../../screens/Settings/ShippingAddress';
import BecomeSeller from '../../screens/BecomeSeller';
import ExistingSeller from '../../screens/ExistingSeller';
import AuctionDetail from '../../screens/AuctionDetail';
import CreateReel from '../../screens/CreateReel';
const AppNavigation = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <>
        <Stack.Screen name="TabNavigation" component={TabNavigation} />
        <Stack.Screen name="AddStory" component={AddStory} />
        <Stack.Screen
          name="Saved"
          component={Saved}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="RequestScreen"
          component={RequestScreen}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="Notifications"
          component={Notifications}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="LanguageSelection"
          component={LanguageSelection}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="SocialActivity"
          component={SocialActivity}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="BiddingAuctionSetting"
          component={BiddingAuctionSetting}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="MarketplaceActivity"
          component={MarketplaceActivity}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettings}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="SecurityPrivacy"
          component={SecurityPrivacy}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="DisableDeleteAccount"
          component={DisableDeleteAccount}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="PurchaseHistory"
          component={PurchaseHistory}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="SavedAuctions"
          component={SavedAuctions}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="ShippingAddress"
          component={ShippingAddress}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="Shop"
          component={Shop}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="ProductView"
          component={ProductView}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetail}
          // options={NavigationOptions}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen
          name="MyOrders"
          component={MyOrders}
          // options={NavigationOptions}
        />

        <Stack.Screen
          name="CreatePost"
          component={CreatePost}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="MediaEditor"
          component={MediaEditor}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MusicPicker"
          component={MusicPicker}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ImageCrop"
          component={ImageCrop}
          options={{headerShown: false, presentation: 'fullScreenModal'}}
        />
        <Stack.Screen
          name="CreateReel"
          component={CreateReel}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="Groups"
          component={Groups}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="GroupDetailsScreen"
          component={GroupDetailsScreen}
          // options={NavigationOptions}
        />

        <Stack.Screen name="CreateGroup" component={CreateGroup} />

        <Stack.Screen
          name="CreatePostEdit"
          component={CreatePostEdit}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactUs}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="AboutUs"
          component={AboutUs}
          options={NavigationOptions}
        />

        <Stack.Screen
          name="ChatOngoing"
          component={ChatOngoing}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="AcknowledgeCall"
          component={AcknowledgeCall}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="VideoCall"
          component={VideoCall}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AudioCall"
          component={AudioCall}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MyOrderDetail"
          component={MyOrderDetail}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="CheckoutScreen"
          component={CheckoutScreen}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="BankDetailUpdate"
          component={BankDetailUpdate}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="BankDetail"
          component={BankDetail}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="MyProfileUpdate"
          component={MyProfileUpdate}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="MyProfilePassword"
          component={MyProfilePassword}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="Payment"
          component={Payment}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="AddStore"
          component={AddStore}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="SubscriptionLogs"
          component={SubscriptionLogs}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="Blogs"
          component={Blogs}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="ViewBlog"
          component={ViewBlog}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="MyBlogs"
          component={MyBlogs}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="AddBlog"
          component={AddBlog}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="EditBlog"
          component={EditBlog}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="SavedChat"
          component={SavedChat}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="SavedChatDetail"
          component={SavedChatDetail}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="SavedScripts"
          component={SavedScripts}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="AddProduct"
          component={AddProduct}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="MyShop"
          component={MyShop}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="EditShop"
          component={EditShop}
          options={NavigationOptions}
        />
        <Stack.Screen
          name="Videos"
          component={VideosTab}
          options={{NavigationOptions}}
        />
        <Stack.Screen
          name="NetworkLogger"
          component={NetworkLogger}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="BecomeSeller"
          component={BecomeSeller}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="ExistingSeller"
          component={ExistingSeller}
          // options={NavigationOptions}
        />
        <Stack.Screen
          name="AuctionDetail"
          component={AuctionDetail}
          // options={NavigationOptions}
        />
      </>
    </Stack.Navigator>
  );
};

export default AppNavigation;
