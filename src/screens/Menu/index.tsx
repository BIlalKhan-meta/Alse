import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Card from '../../components/Card';
import styles from './styles';
import {images} from '../../utils/images';
import InterRegular from '../../components/Text/InterRegular';
import InterMedium from '../../components/Text/InterMedium';
import {useNavigation} from '@react-navigation/native';
import {vh, vw} from '../../constant';
import {colors} from '../../utils/theme';
import {useAppDispatch} from '../../hooks/storeHooks';
import {
  logout,
  LogoutUser,
  selectUserProfile,
} from '../../store/slices/authSlice';
import {useSelector} from 'react-redux';

const Menu: React.FC = () => {
  const navigation = useNavigation();

  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(LogoutUser());
    // navigation.navigate('Login');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Card style={styles.cardContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('MyProfile')}>
            <View style={styles.contentCon}>
              <View style={styles.avatarContainer}>
                <Image
                  source={user?.avatar ? {uri: user?.avatar} : images.user}
                  style={[styles.imageStyle, {borderRadius: vw * 6}]}
                />
              </View>
              <InterRegular style={styles.userName}>
                {user?.full_name}
              </InterRegular>
            </View>
          </TouchableOpacity>
        </Card>

        <Card style={styles.cardContainer}>
          <View style={styles.cardContent2}>
            <InterMedium style={styles.cardHeading}>
              - &nbsp;&nbsp;&nbsp;Social Interactivity
            </InterMedium>
            <View style={styles.btnCon}>
              <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <InterRegular style={styles.cardText}>Home</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreatePost')}>
                <InterRegular style={styles.cardText}>Create Post</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('MyPosts')}>
                <InterRegular style={styles.cardText}>My Posts</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('BlockedUsers')}>
                <InterRegular style={styles.cardText}>
                  Blocked Users
                </InterRegular>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('ChatScreen')}>
                <InterRegular style={styles.cardText}>
                  Chats and Groups
                </InterRegular>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('SavedChat')}>
                <InterRegular style={styles.cardText}>Recordings</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('SavedScripts')}>
                <InterRegular style={styles.cardText}>Scripts</InterRegular>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        <Card style={styles.cardContainer}>
          <View style={styles.cardContent2}>
            <InterMedium style={styles.cardHeading}>
              - &nbsp;&nbsp;&nbsp;Marketplace
            </InterMedium>
            <View style={styles.btnCon}>
              <TouchableOpacity
                onPress={() => navigation.navigate('MarketPlaceNavigation')}>
                <InterRegular style={styles.cardText}>Shops</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
                <InterRegular style={styles.cardText}>My Cart</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('BankDetail')}>
                <InterRegular style={styles.cardText}>
                  Manage Bank Details
                </InterRegular>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('MarketPlaceNavigation', {
                    screen: 'PaymentLogs',
                  })
                }>
                <InterRegular style={styles.cardText}>
                  Payment Logs
                </InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('MyOrders')}>
                <InterRegular style={styles.cardText}>Order Logs</InterRegular>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        <Card style={styles.cardContainer}>
          <View style={styles.cardContent2}>
            <InterMedium style={styles.cardHeading}>
              - &nbsp;&nbsp;&nbsp;Educational Library
            </InterMedium>
            <View style={styles.btnCon}>
              <TouchableOpacity onPress={() => navigation.navigate('Blogs')}>
                <InterRegular style={styles.cardText}>
                  View Content
                </InterRegular>
              </TouchableOpacity>
              {!user.is_child && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('SubscriptionLogs')}>
                  <InterRegular style={styles.cardText}>
                    Subscription Logs
                  </InterRegular>
                </TouchableOpacity>
              )}

              {/* <TouchableOpacity onPress={() => navigation.navigate('Games')}>
                <InterRegular style={styles.cardText}>Games</InterRegular>
              </TouchableOpacity> */}
            </View>
          </View>
        </Card>

        <Card style={styles.cardContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}>
            <View style={styles.cardContent5}>
              <View style={styles.notifiCon}>
                <Image source={images.notifi} style={styles.imageStyle} />
              </View>
              <InterMedium style={styles.cardHeading}>Notification</InterMedium>
            </View>
          </TouchableOpacity>
        </Card>

        <Card style={styles.cardContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('RequestScreen')}>
            <View style={styles.cardContent5}>
              <View style={styles.notifiCon}>
                <Image source={images.request} style={styles.imageStyle} />
              </View>
              <InterMedium style={styles.cardHeading}>Requests</InterMedium>
            </View>
          </TouchableOpacity>
        </Card>

        <Card style={styles.cardContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('SubscriptionPlan')}>
            <View style={styles.cardContent5}>
              <View style={[styles.notifiCon, {width: vw * 9}]}>
                <Image source={images.plan} style={styles.imageStyle} />
              </View>
              {!user.is_child && (
                <InterMedium style={styles.cardHeading}>
                  Subscription Plan
                </InterMedium>
              )}
            </View>
          </TouchableOpacity>
        </Card>

        <Card style={styles.cardContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Blogs')}>
            <View style={styles.cardContent5}>
              <View style={[styles.notifiCon, {width: vw * 8}]}>
                <Image source={images.blogs} style={styles.imageStyle} />
              </View>
              <InterMedium style={styles.cardHeading}>Blogs</InterMedium>
            </View>
          </TouchableOpacity>
        </Card>

        <View style={styles.bottomCon}>
          <Card style={styles.cardContainer2}>
            <TouchableOpacity onPress={() => navigation.navigate('Saved')}>
              <View style={styles.cardContent5}>
                <View style={styles.notifiCon}>
                  <Image
                    source={images.save}
                    style={styles.imageStyle}
                    tintColor={colors.themeColor}
                  />
                </View>
                <InterMedium style={styles.cardHeading}>
                  Saved Items
                </InterMedium>
              </View>
            </TouchableOpacity>
          </Card>

          <Card style={styles.cardContainer2}>
            <TouchableOpacity onPress={() => navigation.navigate('ContactUs')}>
              <View style={styles.cardContent5}>
                <View style={[styles.notifiCon, {width: vw * 8}]}>
                  <Image source={images.phone} style={styles.imageStyle} />
                </View>
                <InterMedium style={styles.cardHeading}>Contact</InterMedium>
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.bottomCon}>
          <Card style={styles.cardContainer2}>
            <TouchableOpacity onPress={() => navigation.navigate('AboutUs')}>
              <View style={styles.cardContent5}>
                <View style={[styles.notifiCon, {width: vw * 8}]}>
                  <Image source={images.help} style={styles.imageStyle} />
                </View>
                <InterMedium style={styles.cardHeading}>About Us</InterMedium>
              </View>
            </TouchableOpacity>
          </Card>

          <Card style={styles.cardContainer2}>
            <TouchableOpacity onPress={handleLogout}>
              <View style={styles.cardContent5}>
                <View style={[styles.notifiCon, {width: vw * 8}]}>
                  <Image source={images.logout} style={styles.imageStyle} />
                </View>
                <InterMedium style={styles.cardHeading}>Log out</InterMedium>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
};

export default Menu;
