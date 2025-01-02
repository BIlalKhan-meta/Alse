import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import InterBold from '../Text/InterBold';
import { images } from '../../utils/images';
import styles from './styles';


interface HeaderComponentProps {
  label: string;
  onBackPress: () => void;
  notifiVisible: boolean;
  onNofiPress: () => void;
  chatVisible: boolean;
  searchVisible: boolean;
  back: boolean;
  onDotPress: () => void;
  dots: boolean;
  onChatPress: () => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({ label, onBackPress, notifiVisible, onNofiPress, chatVisible, searchVisible, back, dots, onDotPress, onChatPress }) => {
  return (
    <View style={styles.header}>


      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {back && <TouchableOpacity
          onPress={() => onBackPress()}
        >
          <Image
            source={images.backicon}
            style={styles.backicon}
          />
        </TouchableOpacity>}
        <InterBold style={styles.headerText}>{label}</InterBold>
      </View>
      <View style={styles.headerIcons}>
        {notifiVisible && <TouchableOpacity
          onPress={onNofiPress}
        >
          <Image
            source={images.bell_icon}
            style={styles.icon}
          />
        </TouchableOpacity>}
        {chatVisible && <TouchableOpacity onPress={onChatPress}>
          <Image
            source={images.chatIcon}
            style={styles.icon}
          />
        </TouchableOpacity>}
        {searchVisible && <TouchableOpacity>
          <Image
            source={images.searchIcon}
            style={styles.icon}
          />
        </TouchableOpacity>}
        {dots && <TouchableOpacity
          onPress={() => onDotPress()}
        >
          <View style={styles.dotIcon}>
            <Image
              source={images.dots}
              style={styles.imageStyle}
            />
          </View>
        </TouchableOpacity>}
      </View>
    </View>
  );
};

export default HeaderComponent;

