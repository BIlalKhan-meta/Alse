// PostComponent.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {images} from '../../utils/images';
import Card from '../Card';
import {fontSizes, vh} from '../../constant';
import InterMedium from '../Text/InterMedium';
import {colors} from '../../utils/theme';
import InterBold from '../Text/InterBold';
import InterLight from '../Text/InterLight';
import InterRegular from '../Text/InterRegular';
import {useNavigation} from '@react-navigation/native';
import ReportBlockModal from '../ReportBlockModal';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {createPost} from '../../api/home';
import Video from 'react-native-video';
import {getTimeOffset} from '../../utils/index';
import {HeartIcon} from 'lucide-react-native';
import {useTranslation} from 'react-i18next';

interface PostProps {
  id?: number;
  postID?: number;
  avatar: string;
  name: string;
  country: string;
  time: string;
  postText: string;
  postImage: string;
  mediaType: string;
  likes: number;
  comments: number;
  share: number;
  account: string;
  onCommnetPress: () => void;
  onSavePress: () => void;
  onLikePress: () => void;
  onDotPress: () => void;
  handleReportPress: () => void;
  handleBlockPress: () => void;
  handleReportPost: () => void;
  onLikesModal: () => void;
  modalVisible: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
  onCardPress: () => void;
  shareLoader: boolean;
  mediaId: boolean;
  isFocused: boolean;
  onMediaPress?: () => void;
}

const PostComponent: React.FC<PostProps> = ({
  id,
  avatar,
  name,
  time,
  postText,
  postImage,
  mediaType,
  likes,
  comments,
  share,
  account,
  onCommnetPress,
  onLikePress,
  onDotPress,
  modalVisible,
  handleReportPress,
  handleBlockPress,
  handleReportPost,
  isLiked,
  onCardPress,
  sharePost,
  isPaused,
  handleVideoPause,
  onMediaPress,
}) => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);

  const [showFullText, setShowFullText] = useState(false);
  const maxTextLength = 100;
  const [numberLikes, setNumberLikes] = useState(likes);
  const [loading, setLoading] = useState(false);
  const [videoLoad, setVideoLoad] = useState(true);
  const [error, setError] = useState(false);
  // console.log("isFocusedisFocused ====>",isFocused)
  useEffect(() => {
    setNumberLikes(likes);
  }, [likes]);

  const {t} = useTranslation();

  const handleLike = () => {
    if (isLiked) {
      setNumberLikes(numberLikes - 1);
    } else {
      setNumberLikes(numberLikes + 1);
    }
    onLikePress();
  };

  const myAccount = user?.id == id ? true : false;

  const goToProfile = () => {
    if (myAccount) {
      navigation.navigate('MyProfile', {account});
    } else if (account) {
      navigation.navigate('Profile', {account, id});
    }
    // navigation.navigate('Profile', {account, id});
  };

  const options = myAccount
    ? [
        {text: 'Edit', onPress: () => handleReportPress()},
        {text: 'Delete', onPress: () => handleBlockPress()},
      ]
    : [{text: 'Report', onPress: () => handleReportPost()}];

  const handleReadMoreToggle = () => {
    setShowFullText(!showFullText);
  };
  const renderPostText = () => {
    if (postText?.length <= maxTextLength || showFullText) {
      return (
        <Text style={styles.postText}>
          {postText}{' '}
          {postText.length > maxTextLength && (
            <Text style={styles.readMoreText} onPress={handleReadMoreToggle}>
              {showFullText ? 'Read Less' : ''}
            </Text>
          )}
        </Text>
      );
    } else {
      return (
        <Text style={styles.postText}>
          {`${postText?.substring(0, maxTextLength)}... `}{' '}
          <Text style={styles.readMoreText} onPress={handleReadMoreToggle}>
            Read More
          </Text>
        </Text>
      );
    }
  };

  const postShare = async () => {
    const data = {
      description: postText,
      privacy: account,
      ...(postImage
        ? {'file[0]': {uri: postImage, name: 'postImage', type: 'image/jpeg'}}
        : {}),
    };

    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      form.append(key, value);
    });
    sharePost(form);
  };

  return (
    <Pressable onPress={onCardPress}>
      <Card style={styles.card}>
        {/* Header section - only for text posts */}
        {!postImage && (
          <View
            style={[
              styles.header,
              {
                borderBottomWidth: 0.5,
                borderBottomColor: '#eee',
                paddingBottom: 10,
              },
            ]}>
            <View style={styles.userInfo}>
              <TouchableOpacity disabled={myAccount} onPress={goToProfile}>
                <Image
                  source={avatar && !error ? {uri: avatar} : images.defaultDp}
                  style={styles.avatar}
                  onError={() => setError(true)}
                />
              </TouchableOpacity>
              <View>
                <InterBold style={styles.name}>{name}</InterBold>
                <InterRegular style={styles.time}>{time}</InterRegular>
              </View>
            </View>
            <TouchableOpacity style={styles.moreButton} onPress={onDotPress}>
              <Image source={images.saveIcon} style={styles.saveIcon} />
            </TouchableOpacity>
          </View>
        )}

        {/* Post image section with overlaid header and interactions */}
        {postImage ? (
          <View style={styles.mediaContainer}>
            {/* Image or video content */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onMediaPress}
              style={styles.mediaTouchable}>
              {mediaType === 'image' ? (
                <Image source={{uri: postImage}} style={styles.postImage} />
              ) : (
                <View>
                  {videoLoad && (
                    <ActivityIndicator
                      size="large"
                      color="white"
                      style={styles.videoLoader}
                    />
                  )}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={{zIndex: 99}}
                    onPress={handleVideoPause}>
                    <Video
                      onReadyForDisplay={() => setVideoLoad(false)}
                      source={{uri: postImage}}
                      style={styles.postImage}
                      resizeMode="cover"
                      repeat={true}
                      paused={isPaused}
                      onBuffer={res => {
                        if (res?.isBuffering) {
                          setVideoLoad(true);
                        }
                      }}
                      ignoreSilentSwitch={'ignore'}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>

            {/* Header overlay for image posts */}
            <View style={styles.headerOverlay}>
              <View style={styles.userInfo}>
                <TouchableOpacity disabled={myAccount} onPress={goToProfile}>
                  <Image
                    source={avatar ? {uri: avatar} : images.user}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
                <View>
                  <Text style={styles.nameOverlay}>{name}</Text>
                  <Text style={styles.timeOverlay}>{time}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton} onPress={onDotPress}>
                <Image
                  source={images.saveIcon}
                  style={[styles.threeDots, {tintColor: '#fff'}]}
                />
              </TouchableOpacity>
            </View>

            {/* App logo overlay */}
            <View style={styles.logoOverlay}>
              <Image
                source={images.logoIcon}
                style={styles.centerLogo}
                tintColor={colors.themeColor}
              />
            </View>

            {/* Right side interaction indicators */}
            <View style={styles.sideInteractions}>
              <TouchableOpacity style={styles.sideButton} onPress={handleLike}>
                <Image
                  // source={isLiked ? images.likeFill : images.like}
                  source={images.heartLikeIcon}
                  style={styles.sideIcon}
                  tintColor={isLiked ? colors.blue : colors.white}
                />
                <Text style={styles.sideCount}>{numberLikes}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sideButton}
                onPress={onCommnetPress}>
                <Image
                  source={images.commentIcon}
                  style={styles.sideIcon}
                  tintColor="#fff"
                />
                <Text style={styles.sideCount}>{comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sideButton} onPress={postShare}>
                <Image
                  source={images.shareIcon}
                  style={styles.sideIcon}
                  tintColor="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Post text content */}
        <View style={styles.postContent}>
          <Text
            style={styles.postText}
            numberOfLines={showFullText ? undefined : 2}>
            {postText}
            {postText && postText.length > maxTextLength && !showFullText && (
              <Text style={styles.readMoreText} onPress={handleReadMoreToggle}>
                {' '}
                {t('more')}
              </Text>
            )}
          </Text>
        </View>

        {/* Post interactions for text-only posts */}
        {!postImage && (
          <View style={styles.textPostActions}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLike}>
                <Image
                  // source={isLiked ? images.likeFill : images.like}
                  source={images.heartLikeIcon}
                  style={styles.HeartIcon}
                  tintColor={isLiked ? colors.blue : colors.lightGrey}
                />
                <Text style={styles.actionText}>{numberLikes}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={onCommnetPress}>
                <Image
                  source={images.commentIcon}
                  style={styles.actionIcon}
                  tintColor={colors.lightGrey}
                />
                <Text style={styles.actionText}>{comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={postShare}>
                <Image
                  source={images.shareIcon}
                  style={styles.actionIcon}
                  tintColor={colors.lightGrey}
                />
                <Text style={styles.actionText}>{share}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ReportBlockModal
          isVisible={modalVisible}
          options={options}
          onClose={onDotPress}
          style={{top: 55}}
        />
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: vh * 1,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  textPostActions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    marginTop: 8,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  actionIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  HeartIcon: {
    width: 25,
    height: 22,
    marginRight: 5,
  },

  actionText: {
    fontSize: fontSizes.f12,
    color: colors.lightGrey,
  },

  // Update header style to work for both cases
  // header: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   padding: 12,
  // },

  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    zIndex: 10,
    // backgroundColor: 'rgba(0,0,0,0.2)', // Semi-transparent background for better readability
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  nameOverlay: {
    fontSize: fontSizes.f14,
    color: '#ffffff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },

  timeOverlay: {
    fontSize: fontSizes.f12,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },

  // You can keep the existing avatar style or adjust as needed

  // Update mediaContainer to not have padding at the top
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: vh * 40,
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  mediaTouchable: {
    width: '100%',
    height: '100%',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: fontSizes.f14,
    color: colors.black,
    fontWeight: 'bold',
  },
  time: {
    fontSize: fontSizes.f12,
    color: colors.lightGrey,
  },
  moreButton: {
    padding: 8,
  },
  threeDots: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  saveIcon: {
    tintColor: '#000',
    padding: 5,
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  // mediaContainer: {
  //   position: 'relative',
  //   width: '100%',
  //   height: vh * 40,
  // },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  logoOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -15}, {translateY: -15}],
    zIndex: 10,
  },
  centerLogo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  sideInteractions: {
    position: 'absolute',
    right: 15,
    bottom: 30,
    alignItems: 'center',
  },
  sideButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  sideIcon: {
    width: 29,
    height: 28,
  },
  sideCount: {
    color: '#fff',
    fontSize: fontSizes.f12,
    marginTop: 4,
  },
  postContent: {
    padding: 12,
  },
  postText: {
    fontSize: fontSizes.f14,
    color: colors.inputText,
    lineHeight: 20,
  },
  readMoreText: {
    color: colors.lightGrey,
  },
  videoLoader: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    zIndex: 100,
  },
});

export default PostComponent;
