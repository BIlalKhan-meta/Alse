// ProfileCard.tsx
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { images } from '../../utils/images';
import { vw } from '../../constant';
import InterBold from '../../components/Text/InterBold';
import InterMedium from '../../components/Text/InterMedium';
import CustomButton from '../CustomButton';
import styles from './styles';
import { useNavigation } from '@react-navigation/native';

interface ProfileCardProps {
  name: string;
  description: string;
  stats: string;
  avatar: string;
  isFollowing: boolean;
  onPress: () => void;

}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, description, stats, avatar, onPress, isFollowing }) => {
  const navigation = useNavigation()
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Icon */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={images.backicon}
            style={styles.icon}
          />
        </TouchableOpacity>

        {/* Avatar */}
        <Image
          source={avatar ? { uri: avatar } : images.user}
          style={styles.avatar}
        />

        {/* Three Dots Icon */}
        <TouchableOpacity style={styles.threeDots}
          onPress={onPress}
        >
          <Image
            source={images.dots}
            style={styles.imageStyle}
          />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profile}>
        <InterBold style={styles.name}>{name}</InterBold>
        <InterMedium style={styles.description}>{description}</InterMedium>
        <InterMedium style={styles.stats}>{stats}</InterMedium>
        {/* Follow Button */}
        <CustomButton style={styles.followButton}
          disable={isFollowing ? true : false}
        >
          {isFollowing ? "Following" : "Follow"}
        </CustomButton>
      </View>
    </View>
  );
};


export default ProfileCard;