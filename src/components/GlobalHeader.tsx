import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Image} from 'react-native';
import {images} from '../utils/images';
import {vh, vw} from '../constant';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../utils/theme';

interface GlobalHeaderProps {
  title?: string;
  icon?: boolean;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({title = 'Alse', icon}) => {
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
          {icon && (
            <View style={[styles.notificationcontainer]}>
              <Image source={images.bellIcon} style={styles.bellIcon} />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.iconButton}>
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
    paddingHorizontal: 6,
    paddingTop: vh * 1,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  title: {
    width: vw * 20,
    height: vh * 4,
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
    tintColor: '#000',
  },
  highlightedContainer: {
    //set l;ightgrey background color when icon is pressed
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  notificationicon: {
    width: vh * 3,
    height: vh * 3,
    resizeMode: 'contain',
    color: '#000',
  },
  bellIcon: {
    width: vh * 3,
    height: vh * 3,
    resizeMode: 'contain',
    // tintColor: '#000',
  },
});

export default GlobalHeader;
