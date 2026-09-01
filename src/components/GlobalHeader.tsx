import React from 'react';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {images} from '../utils/images';
import {vh, vw} from '../constant';
import {useNavigation} from '@react-navigation/native';
import {ChevronLeft} from 'lucide-react-native';
import {colors} from '../utils/theme';

interface GlobalHeaderProps {
  title?: string;
  icon?: boolean;
  /** Skip status-bar padding when parent already uses SafeAreaView */
  embedInSafeArea?: boolean;
  showBack?: boolean;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  icon,
  embedInSafeArea = false,
  showBack = false,
}) => {
  const navigation = useNavigation();

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    // Tab screens (e.g. Search) have no stack history — go Home.
    (navigation as any).navigate('HomeNavigation', {screen: 'Home'});
  };

  return (
    <View
      style={[
        styles.container,
        embedInSafeArea && styles.containerInSafeArea,
      ]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ChevronLeft size={22} color={colors.black} strokeWidth={2.5} />
          </TouchableOpacity>
        )}
        <Image source={images.alseLogo} style={styles.title} />
      </View>
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
          testID="header-settings"
          onPress={() => navigation.navigate('Settings')}
          style={styles.iconButton}>
          <View style={styles.notificationcontainer}>
            <Image
              source={images.settingsIcon}
              style={styles.notificationicon}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('ChatScreen')}>
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
    paddingTop: vh * 4,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  containerInSafeArea: {
    paddingTop: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E4E6EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 6,
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
