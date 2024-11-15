// ProfileCard.tsx
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {images} from '../../utils/images';
import InterBold from '../../components/Text/InterBold';
import InterMedium from '../../components/Text/InterMedium';
import CustomButton from '../CustomButton';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {userFollow, userUnFollow} from '../../api/home';
import Toast from 'react-native-toast-message';

interface ProfileCardProps {
  name: string;
  description: string;
  stats: string;
  avatar: string;
  isFollowing: boolean;
  onPress: () => void;
  id: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  description,
  stats,
  avatar,
  onPress,
  isFollowing,
  id,
}) => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);

  const [followLoader, setFollowLoader] = useState(false);
  const [follow, setFollow] = useState(isFollowing);

  useEffect(() => {
    setFollow(isFollowing);
  }, [isFollowing]);

  const handleFollow = () => {
    setFollowLoader(true);
    if (follow) {
      userUnFollow(id)
        .then(res => {
          if (res?.data) {
            setFollow(!follow);
            Toast.show({
              type: 'success',
              text1: 'UnFollowd',
              text2: res?.data?.message,
            });
          }
        })
        .finally(() => {
          setFollowLoader(false);
        });
    } else {
      userFollow(id)
        .then(res => {
          if (res?.data) {
            setFollow(!follow);
            Toast.show({
              type: 'success',
              text1: 'Unfollowed',
              text2: res?.data?.message,
            });
          }
        })
        .catch(err => {
          console.log('error from block User ====>', err);
        })
        .finally(() => {
          setFollowLoader(false);
        });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Icon */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={images.backicon} style={styles.icon} />
        </TouchableOpacity>

        {/* Avatar */}
        <Image
          source={avatar ? {uri: avatar} : images.user}
          style={styles.avatar}
        />

        {/* Three Dots Icon */}
        <TouchableOpacity style={styles.threeDots} onPress={onPress}>
          <Image source={images.dots} style={styles.imageStyle} />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profile}>
        <InterBold style={styles.name}>{name}</InterBold>
        <InterMedium style={styles.description}>{description}</InterMedium>
        <InterMedium style={styles.stats}>{stats}</InterMedium>
        {/* Follow Button */}

        {user?.id !== id && (
          <CustomButton
            style={styles.followButton}
            onPress={handleFollow}
            loading={followLoader}>
            {follow ? 'Following' : 'Follow'}
          </CustomButton>
        )}
      </View>
    </View>
  );
};

export default ProfileCard;
