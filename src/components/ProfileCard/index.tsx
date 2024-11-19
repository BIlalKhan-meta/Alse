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
import {createChat, userFollow, userUnFollow} from '../../api/home';
import Toast from 'react-native-toast-message';
import {vw} from '../../constant';

interface ProfileCardProps {
  name: string;
  description: string;
  stats: string;
  avatar: string;
  isFollowing: boolean;
  is_private: boolean;
  isRequested: boolean;
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
  isRequested,
  is_private,
  id,
}) => {

  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);

  const [followLoader, setFollowLoader] = useState(false);
  const [follow, setFollow] = useState(
    isFollowing ? 'following' : isRequested ? 'requested' : 'notFollowing',
  );

  const handleFollow = () => {
    setFollowLoader(true);

    if (follow === 'notFollowing') {
      if (!is_private) {
        // Request follow for private profile
        userFollow(id)
          .then(res => {
            if (res?.data) {
              console.log('REQUESTINGGGGGGGGGGGGGGGGGGGGGGGG================');
              setFollow('requested');
              Toast.show({
                type: 'success',
                text1: 'Follow Request Sent',
                text2: res?.data?.message,
              });
            }
          })
          .catch(err => {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to send follow request.',
            });
            console.log('Error sending follow request:', err);
          })
          .finally(() => {
            setFollowLoader(false);
          });
      } else {
        // Follow public profile directly
        userFollow(id)
          .then(res => {
            if (res?.data) {
              console.log('FOLLOWINGGGGGGGGGGGGGGGGGG=================');
              setFollow('following');
              Toast.show({
                type: 'success',
                text1: 'Followed',
                text2: res?.data?.message,
              });
            }
          })
          .catch(err => {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to follow user.',
            });
            console.log('Error following user:', err);
          })
          .finally(() => {
            setFollowLoader(false);
          });
      }
    } else if (follow === 'following' || follow === 'requested') {
      // Unfollow or cancel follow request
      userUnFollow(id)
        .then(res => {
          if (res?.data) {
            console.log(
              'UNFOLOWWWWWWWWWWWWWWWWWWWWWWWWWWWINGGGGG===================',
            );
            setFollow('notFollowing');
            Toast.show({
              type: 'success',
              text1: 'Unfollowed',
              text2: res?.data?.message,
            });
          }
        })
        .catch(err => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to unfollow user.',
          });
          console.log('Error unfollowing user:', err);
        })
        .finally(() => {
          setFollowLoader(false);
        });
    }
  };

  const handleMessage = () =>{
    console.log("Messageads");
    const data ={
      user_id : id
    }
    const form = new FormData()
    form.append('user_id', data?.user_id)
    console.log("formformformformform ====>", form)
    createChat(data).then(res =>{
      console.log("Respose from Create Chat",res)
    }).catch(err =>{
      console.log("Error from Create Chat -----", err)
    })
    
    
  }

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
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {follow === 'following' ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <CustomButton
                  style={styles.smallbtn}
                  onPress={handleFollow}
                  loading={followLoader}>
                  {'Following'}
                </CustomButton>
                <CustomButton
                  style={styles.smallbtn}
                  onPress={handleMessage}
                  loading={followLoader}>
                  {'Message'}
                </CustomButton>
              </View>
            ) : follow === 'requested' ? (
              <CustomButton
                style={styles.followButton}
                onPress={handleFollow}
                loading={followLoader}>
                {'Request Sent'}
              </CustomButton>
            ) : (
              <CustomButton
                style={styles.followButton}
                onPress={handleFollow}
                loading={followLoader}>
                {'Follow'}
              </CustomButton>
            )}
            {/* <CustomButton
            style={styles.followButton}
            onPress={handleFollow}
            loading={followLoader}>
            {follow ? 'Following' : 'Follow'}
          </CustomButton> */}
          </View>
        )}
      </View>
    </View>
  );
};

export default ProfileCard;
