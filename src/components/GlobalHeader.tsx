import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Image} from 'react-native';
import {images} from '../utils/images';
import {vh, vw} from '../constant';
import {useNavigation} from '@react-navigation/native';

interface GlobalHeaderProps {
  title?: string;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({title = 'Alse'}) => {
  const navigation = useNavigation();

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };
  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>{title}</Text> */}
      <Image source={images.alseLogo} style={styles.title} />
      <View style={styles.iconsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleNotificationPress}>
          <View style={styles.notificationcontainer}>
            <Image source={images.bellIcon} style={styles.notificationicon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.notificationcontainer}>
            <Image
              source={images.settingsIcon}
              style={styles.notificationicon}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.notificationcontainer}>
            <Image source={images.smsIcon} style={styles.notificationicon} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: vh * 2,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  title: {
    width: vw * 20,
    height: vh * 5,
    resizeMode: 'contain',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 0,
  },
  notificationcontainer: {
    width: vw * 10,
    height: vh * 5,
    borderRadius: vw * 10,
    backgroundColor: 'transparent',
    marginHorizontal: vw * 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationicon: {
    width: vh * 3,
    height: vh * 3,
    resizeMode: 'contain',
  },
});

export default GlobalHeader;
