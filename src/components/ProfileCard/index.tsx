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
import InterRegular from '../Text/InterRegular';
import {useTranslation} from 'react-i18next';
import CustomImage from '../CustomeImage';

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
  username?: string;
  location?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  phoneNumber?: string;
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
  username = '@alsedaise',
  location = 'Jersey, NY',
  postsCount,
  followersCount = 582,
  followingCount = 321,
  phoneNumber,
}) => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);

  const [followLoader, setFollowLoader] = useState(false);
  const [messageLoader, setMessageLoader] = useState(false);

  const [follow, setFollow] = useState(
    isFollowing ? 'following' : isRequested ? 'requested' : 'notFollowing',
  );

  const {t} = useTranslation();

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
                text1: t('toast.followRequestSent'),
                text2: res?.data?.message,
              });
            }
          })
          .catch(err => {
            Toast.show({
              type: 'error',
              text1: t('error'),
              text2: t('toast.followReqFailed'),
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
                text1: t('followed'),
                text2: res?.data?.message,
              });
            }
          })
          .catch(err => {
            Toast.show({
              type: 'error',
              text1: t('error'),
              text2: t('toast.followReqFailed'),
            });
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
            console.log();
            setFollow('notFollowing');
            Toast.show({
              type: 'success',
              text1: t('unfollowed'),
              text2: res?.data?.message,
            });
          }
        })
        .catch(err => {
          Toast.show({
            type: 'error',
            text1: t('error'),
            text2: t('toast.unfollowFailed'),
          });
          console.log('Error unfollowing user:', err);
        })
        .finally(() => {
          setFollowLoader(false);
        });
    }
  };

  const handleMessage = () => {
    setMessageLoader(true);
    const data = {
      user_id: id,
    };
    const form = new FormData();
    form.append('user_id', data?.user_id);
    console.log('formformformformform ====>', form);
    createChat(data)
      .then(res => {
        setMessageLoader(false);

        navigation.navigate('ChatOngoing', {
          id: res?.data?.data?.id,
          name: name,
          phoneNumber: phoneNumber,
        });
        // console.log('Respose from Create Chat', res?.data?.data);
      })
      .catch(err => {
        setMessageLoader(false);

        console.log('Error from Create Chat -----', err);
      });
  };

  return (
    // <View style={styles.container}>
    //   {/* Header */}
    //   {/* <View style={styles.header}>

    //     <TouchableOpacity onPress={() => navigation.goBack()}>
    //       <Image source={images.backicon} style={styles.icon} />
    //     </TouchableOpacity>

    //     <Image
    //       source={avatar ? {uri: avatar} : images.user}
    //       style={styles.avatar}
    //     />

    //     <TouchableOpacity style={styles.threeDots} onPress={onPress}>
    //       <Image source={images.dots} style={styles.imageStyle} />
    //     </TouchableOpacity>
    //   </View> */}

    //   {/* Profile Info */}
    //   <View style={styles.profile}>
    //     <InterBold style={styles.name}>{name}</InterBold>
    //     <InterMedium style={styles.description}>{description}</InterMedium>
    //     <InterMedium style={styles.stats}>{stats}</InterMedium>
    //     {/* Follow Button */}

    //     {user?.id !== id && (
    //       <View style={{flexDirection: 'row', alignItems: 'center'}}>
    //         {follow === 'following' ? (
    //           <View
    //             style={{
    //               flexDirection: 'row',
    //               justifyContent: 'space-between',
    //               width: '100%',
    //             }}>
    //             <CustomButton
    //               style={styles.smallbtn}
    //               onPress={handleFollow}
    //               loading={followLoader}>
    //               {'Following'}
    //             </CustomButton>
    //             <CustomButton
    //               style={styles.smallbtn}
    //               onPress={handleMessage}
    //               loading={messageLoader}>
    //               {'Message'}
    //             </CustomButton>
    //           </View>
    //         ) : follow === 'requested' ? (
    //           <CustomButton
    //             style={styles.followButton}
    //             onPress={handleFollow}
    //             loading={followLoader}>
    //             {'Request Sent'}
    //           </CustomButton>
    //         ) : (
    //           <CustomButton
    //             style={styles.followButton}
    //             onPress={handleFollow}
    //             loading={followLoader}>
    //             {'Follow'}
    //           </CustomButton>
    //         )}
    //         {/* <CustomButton
    //         style={styles.followButton}
    //         onPress={handleFollow}
    //         loading={followLoader}>
    //         {follow ? 'Following' : 'Follow'}
    //       </CustomButton> */}
    //       </View>
    //     )}
    //   </View>
    // </View>

    <View style={styles.container}>
      {/* Header with profile info */}
      <View style={styles.headerContainer}>
        <View style={styles.profileImageContainer}>
          <CustomImage
            // source={avatar ? {uri: avatar} : images.user}
            source={{uri: avatar}}
            style={styles.profileImage}
          />
        </View>
        <View style={styles.userInfoContainer}>
          <View style={styles.nameContainer}>
            <View>
              <InterBold style={styles.name}>{name}</InterBold>
              <InterRegular style={styles.username}>{username}</InterRegular>
            </View>
            <InterRegular style={styles.location}>{location}</InterRegular>
          </View>
        </View>
      </View>

      <InterRegular style={styles.bio}>
        {description ||
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'}
      </InterRegular>
      {/* Stats row */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <InterBold style={styles.statNumber}>{postsCount}</InterBold>
          <InterRegular style={styles.statLabel}>Posts</InterRegular>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statItem}>
          <InterBold style={styles.statNumber}>{followersCount}</InterBold>
          <InterRegular style={styles.statLabel}>Followers</InterRegular>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statItem}>
          <InterBold style={styles.statNumber}>{followingCount}</InterBold>
          <InterRegular style={styles.statLabel}>Following</InterRegular>
        </View>
      </View>

      {/* Buttons */}
      {user?.id !== id && (
        <View style={styles.buttonContainer}>
          <CustomButton
            style={styles.followButton}
            onPress={handleFollow}
            loading={followLoader}>
            {follow === 'following'
              ? 'Following'
              : follow === 'requested'
              ? 'Requested'
              : 'Follow'}
          </CustomButton>
          <CustomButton
            style={styles.messageButton}
            txtstyle={{color: 'black'}}
            onPress={handleMessage}
            loading={messageLoader}>
            {'Message'}
          </CustomButton>
        </View>
      )}

      {/* Three dots menu button */}
      {/* <TouchableOpacity style={styles.menuButton} onPress={onPress}>
        <Image source={images.dots} style={styles.menuIcon} />
      </TouchableOpacity> */}
    </View>
  );
};

export default ProfileCard;
