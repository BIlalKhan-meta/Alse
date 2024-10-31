// ProfileCard.tsx
import React, {useState} from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {images} from '../../utils/images';
import {vw} from '../../constant';
import InterBold from '../../components/Text/InterBold';
import InterMedium from '../../components/Text/InterMedium';
import CustomButton from '../CustomButton';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch} from '../../hooks/storeHooks';
import {followUser} from '../../store/slices/homeSlice';
import {getMessage, Toast} from '../../utils/helpers';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';

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
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);

  const [followLoader, setFollowLoader] = useState(false);
  const [checkFollow, setCheckFollow] = useState(isFollowing);
  console.log(user, 'iddddddddddddddddddddd');

  const handleFollow = () => {
    dispatch(followUser(id))
      .then(res => {
        setFollowLoader(false);
        console.log('res from block User ====>', res);
      })
      .catch(err => {
        setFollowLoader(false);

        console.log('error from block User ====>', err);
        Toast.error(getMessage(err));
      });
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
            disable={checkFollow ? true : false}
            onPress={handleFollow}
            loading={followLoader}>
            {checkFollow ? 'Following' : 'Follow'}
          </CustomButton>
        )}
      </View>
    </View>
  );
};

export default ProfileCard;
