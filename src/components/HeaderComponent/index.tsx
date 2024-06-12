import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import InterBold from '../Text/InterBold';
import { images } from '../../utils/images';
import styles from './styles';


interface HeaderComponentProps {
  label: string;
  onBackPress: () => void;
  notifiVisible: boolean;
  chatVisible: boolean;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({ label, onBackPress, notifiVisible, chatVisible }) => {
  return (
    <View style={styles.header}>
      <InterBold style={styles.headerText}>{label}</InterBold>
      <View style={styles.headerIcons}>
        {notifiVisible && <TouchableOpacity>
          <Image
            source={images.bellIcon}
            style={styles.icon}
          />
        </TouchableOpacity>}
        {chatVisible && <TouchableOpacity>
          <Image
            source={images.chatIcon}
            style={styles.icon}
          />
        </TouchableOpacity>}
        <TouchableOpacity>
          <Image
            source={images.searchIcon}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeaderComponent;

