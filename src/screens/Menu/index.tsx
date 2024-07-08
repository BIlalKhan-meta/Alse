import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Card from '../../components/Card';
import styles from './styles';
import { images } from '../../utils/images';
import InterRegular from '../../components/Text/InterRegular';
import InterMedium from '../../components/Text/InterMedium';
import { useNavigation } from '@react-navigation/native';
import { vh, vw } from '../../constant';
import { colors } from '../../utils/theme';

const Menu: React.FC = () => {
  const navigation = useNavigation();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Card style={styles.cardContainer}>
          <View style={styles.contentCon}>
            <View style={styles.avatarContainer}>
              <Image source={images.user} style={styles.imageStyle} />
            </View>
            <InterRegular style={styles.userName}>Juliana David</InterRegular>
          </View>
        </Card>

        <Card style={styles.cardContainer}>
          <View style={styles.cardContent2}>
            <InterMedium style={styles.cardHeading}>- &nbsp;&nbsp;&nbsp;Social Interactivity</InterMedium>
            <View style={styles.btnCon}>
              <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <InterRegular style={styles.cardText}>Home</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
                <InterRegular style={styles.cardText}>Create Post</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('MyPosts')}>
                <InterRegular style={styles.cardText}>My Posts</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('BlockedUsers')}>
                <InterRegular style={styles.cardText}>Blocked Users</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('ChatsAndGroups')}>
                <InterRegular style={styles.cardText}>Chats and Groups</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Recordings')}>
                <InterRegular style={styles.cardText}>Recordings</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Scripts')}>
                <InterRegular style={styles.cardText}>Scripts</InterRegular>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        <Card style={styles.cardContainer}>
          <View style={styles.cardContent2}>
            <InterMedium style={styles.cardHeading}>- &nbsp;&nbsp;&nbsp;Marketplace</InterMedium>
            <View style={styles.btnCon}>
              <TouchableOpacity onPress={() => navigation.navigate('Shops')}>
                <InterRegular style={styles.cardText}>Shops</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('MyCart')}>
                <InterRegular style={styles.cardText}>My Cart</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('BankDetails')}>
                <InterRegular style={styles.cardText}>Manage Bank Details</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('PaymentLogs')}>
                <InterRegular style={styles.cardText}>Payment Logs</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('OrderLogs')}>
                <InterRegular style={styles.cardText}>Order Logs</InterRegular>
              </TouchableOpacity>

            </View>
          </View>
        </Card>

        <Card style={styles.cardContainer}>
          <View style={styles.cardContent2}>
            <InterMedium style={styles.cardHeading}>- &nbsp;&nbsp;&nbsp;Educational Library</InterMedium>
            <View style={styles.btnCon}>
              <TouchableOpacity onPress={() => navigation.navigate('ViewContent')}>
                <InterRegular style={styles.cardText}>View Content</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('SubscriptionLogs')}>
                <InterRegular style={styles.cardText}>Subscription Logs</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Games')}>
                <InterRegular style={styles.cardText}>Games</InterRegular>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('PaymentLogs')}>
                <InterRegular style={styles.cardText}>Payment Logs</InterRegular>
              </TouchableOpacity>


            </View>
          </View>
        </Card>

        <Card style={styles.cardContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
          >
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
            onPress={() => navigation.navigate("RequestScreen")}
          >

            <View style={styles.cardContent5}>
              <View style={styles.notifiCon}>
                <Image source={images.request} style={styles.imageStyle} />
              </View>
              <InterMedium style={styles.cardHeading}>Requests</InterMedium>
            </View>
          </TouchableOpacity>
        </Card>

        <Card style={styles.cardContainer}>
          <View style={styles.cardContent5}>
            <View style={[styles.notifiCon, { width: vw * 9 }]}>
              <Image source={images.plan} style={styles.imageStyle} />
            </View>
            <InterMedium style={styles.cardHeading}>Subscription Plan</InterMedium>
          </View>
        </Card>

        <Card style={styles.cardContainer}>
          <View style={styles.cardContent5}>
            <View style={[styles.notifiCon, { width: vw * 8 }]}>
              <Image source={images.blogs} style={styles.imageStyle} />
            </View>
            <InterMedium style={styles.cardHeading}>Blogs</InterMedium>
          </View>
        </Card>

        <View style={styles.bottomCon}>
          <Card style={styles.cardContainer2}>
            <View style={styles.cardContent5}>
              <View style={styles.notifiCon}>
                <Image source={images.save} style={styles.imageStyle} tintColor={colors.themeColor} />
              </View>
              <InterMedium style={styles.cardHeading}>Saved Items</InterMedium>
            </View>
          </Card>

          <Card style={styles.cardContainer2}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ContactUs")}

            >

              <View style={styles.cardContent5}>
                <View style={[styles.notifiCon, { width: vw * 8 }]}>
                  <Image source={images.phone} style={styles.imageStyle} />
                </View>
                <InterMedium style={styles.cardHeading}>Contact</InterMedium>
              </View>
            </TouchableOpacity>
          </Card>

        </View>

        <View style={styles.bottomCon}>
          <Card style={styles.cardContainer2}>
            <TouchableOpacity
              onPress={() => navigation.navigate("AboutUs")}

            >
              <View style={styles.cardContent5}>
                <View style={[styles.notifiCon, { width: vw * 8 }]}>
                  <Image source={images.help} style={styles.imageStyle} />
                </View>
                <InterMedium style={styles.cardHeading}>About Us</InterMedium>
              </View>
            </TouchableOpacity>
          </Card>

          <Card style={styles.cardContainer2}>
            <View style={styles.cardContent5}>
              <View style={[styles.notifiCon, { width: vw * 8 }]}>
                <Image source={images.logout} style={styles.imageStyle} />
              </View>
              <InterMedium style={styles.cardHeading}>Log out</InterMedium>
            </View>
          </Card>

        </View>



      </View>
    </ScrollView>
  );
};



export default Menu;
