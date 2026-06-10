// PostComponent.tsx
import {useNavigation} from '@react-navigation/native';
import {MoreVertical, Heart, MessageCircle, Bookmark, ThumbsUp, CornerUpRight} from 'lucide-react-native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PermissionsAndroid,
  PixelRatio,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
import {useSelector} from 'react-redux';
import {DEVICE_WIDTH, fontSizes, vh} from '../../constant';
import {selectUserProfile} from '../../store/slices/authSlice';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import Card from '../Card';
import CustomImage from '../CustomeImage';
import ReportBlockModal from '../ReportBlockModal';
import ShareModal from '../ShareModal';
import InterBold from '../Text/InterBold';
import InterRegular from '../Text/InterRegular';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {
  buildSharedDescription,
  changeUrlForData,
  createVideoFile,
  parseSharedFrom,
} from '../../utils/helpers';

/**
 * Insets the native video view so scaled frames don’t draw past the layout box.
 * Bottom is worst for list bleed → use a larger bottom inset than sides.
 */
const VIDEO_INSET_X = Math.max(3, Math.round(4 / PixelRatio.get()));
const VIDEO_INSET_TOP = Math.max(2, Math.round(3 / PixelRatio.get()));
const VIDEO_INSET_BOTTOM = Math.max(8, Math.round(12 / PixelRatio.get()));

const requestStoragePermission = async () => {
  try {
    if (Platform.OS !== 'android') return true; // iOS doesn't need it

    let permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    if (Platform.Version >= 33) {
      // Android 13+ (API 33)
      permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
    }

    const granted = await PermissionsAndroid.request(permission, {
      title: 'Storage Permission Required',
      message: 'This app needs access to your storage to download images.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });

    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Permission Blocked',
        'Storage permission is permanently denied. Please enable it from settings.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
        ],
      );
      return false;
    }

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const saveToGallery = async (filePath: any) => {
  try {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    const savedUri = await CameraRoll.save(filePath, {
      type: 'photo',
      album: 'Alenga App', // optional custom album name
    });

    console.log('✅ Saved to gallery:', savedUri);
    Alert.alert('Success', 'Image saved to gallery!');
  } catch (error) {
    console.error('Save error:', error);
    Alert.alert('Error', 'Failed to save image to gallery.');
  }
};

const downloadImage = async (imageUrl: any) => {
  try {
    // Define the local path where you want to save the image
    const fileName = imageUrl.split('/').pop(); // extract file name from URL
    const downloadDest = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    // Start downloading
    const result = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: downloadDest,
    }).promise;

    if (result.statusCode === 200) {
      console.log('Image downloaded successfully:', downloadDest);
      return downloadDest;
    } else {
      console.log('Download failed with status code:', result.statusCode);
      return null;
    }
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
};

interface PostMediaItem {
  id?: number;
  path: string;
  type: string;
}

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
  mediaList?: PostMediaItem[];
  likes: number;
  comments: number;
  share: number;
  account: string;
  onCommnetPress: () => void;
  onSavePress?: () => void;
  onLikePress: () => void;
  onDotPress: () => void;
  handleReportPress: () => void;
  handleBlockPress: () => void;
  handleReportPost: () => void;
  onLikesModal?: () => void;
  modalVisible: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
  onCardPress: () => void;
  mediaId?: number | boolean;
  isFocused: boolean;
  onMediaPress?: (media: PostMediaItem, index: number) => void;
  sharePost?: (form: FormData) => void;
  sharedFromName?: string | null;
  isPaused?: boolean;
  handleVideoPause?: () => void;
  /** When true, inline feed video plays without sound (fullscreen modal can unmute). */
  muteInlineVideo?: boolean;
}

const PostComponent: React.FC<PostProps> = ({
  id,
  mediaId,
  avatar,
  name,
  country,
  time,
  postText,
  postImage,
  mediaType,
  mediaList,
  likes,
  comments,
  share,
  account,
  onCommnetPress,
  onSavePress,
  onLikePress,
  onDotPress,
  modalVisible,
  handleReportPress,
  handleBlockPress,
  handleReportPost,
  isLiked,
  isSaved,
  onCardPress,
  sharePost,
  sharedFromName,
  isFocused,
  isPaused,
  handleVideoPause,
  onMediaPress,
  muteInlineVideo,
}) => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);

  const [showFullText, setShowFullText] = useState(false);
  const maxTextLength = 100;
  const [numberLikes, setNumberLikes] = useState(likes);
  const [videoLoad, setVideoLoad] = useState(true);
  const [error, setError] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mediaSlideWidth, setMediaSlideWidth] = useState(DEVICE_WIDTH);

  const resolvedMediaList: PostMediaItem[] =
    mediaList && mediaList.length > 0
      ? mediaList
      : postImage
        ? [{path: postImage, type: mediaType}]
        : [];

  const isVideoMedia = (type: string) =>
    String(type ?? '').toLowerCase() === 'video';

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [mediaList, postImage, mediaType]);
  useEffect(() => {
    setNumberLikes(likes);
  }, [likes]);

  useEffect(() => {
    const activeMedia = resolvedMediaList[activeMediaIndex];
    if (activeMedia && isVideoMedia(activeMedia.type)) {
      setVideoLoad(true);
    }
  }, [activeMediaIndex, mediaList, postImage, mediaType]);

  const {t} = useTranslation();
  const videoPaused = isPaused !== undefined ? isPaused : !isFocused;

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

  const handleDownload = async () => {
    onDotPress();
    const hasPermission = await requestStoragePermission();

    if (hasPermission) {
      const filePath = await downloadImage(postImage);
      if (filePath) {
        saveToGallery(filePath);
        console.log('Saved to:', filePath);
      }
    }
  };

  const options = myAccount
    ? [
        {text: 'Edit', onPress: () => handleReportPress()},
        {text: 'Remove', onPress: () => handleBlockPress()},
      ]
    : [
        {text: 'Report', onPress: () => handleReportPost()},
        {text: 'Hide post', onPress: () => {}},
        ...(postImage && mediaType === 'image'
          ? [{text: 'Download', onPress: handleDownload}]
          : []),
      ];

  const handleReadMoreToggle = () => {
    setShowFullText(!showFullText);
  };

  const handleOpenShareModal = () => {
    setShareModalVisible(true);
  };

  const postShare = async () => {
    if (!sharePost) {
      return;
    }
    const shareMedia = resolvedMediaList[0];
    const shareImagePath = shareMedia?.path ?? postImage;
    const shareMediaType = shareMedia?.type ?? mediaType;
    const {caption} = parseSharedFrom(postText || '');
    const description = buildSharedDescription(caption, name);
    const filePayload =
      shareImagePath && isVideoMedia(shareMediaType)
        ? createVideoFile(shareImagePath)
        : shareImagePath
          ? {
              uri: shareImagePath,
              name: 'postImage.jpg',
              type: 'image/jpeg' as const,
            }
          : null;
    const data: Record<string, unknown> = {
      description,
      privacy: account,
      ...(filePayload ? {'file[0]': filePayload} : {}),
    };

    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      form.append(key, value as any);
    });
    sharePost(form);
  };

  const handleCarouselScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const width = event.nativeEvent.layoutMeasurement.width;
    if (!width) {
      return;
    }
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveMediaIndex(index);
  };

  const renderMediaSlide = (item: PostMediaItem, index: number) => {
    const isVideo = isVideoMedia(item.type);
    const shouldPlayVideo =
      isVideo && isFocused === true && !videoPaused && activeMediaIndex === index;

    return (
      <View style={[styles.mediaSlide, {width: mediaSlideWidth}]}>
        {isVideo ? (
          <View style={styles.videoInlineWrap} collapsable={false}>
            {shouldPlayVideo ? (
              <>
                {videoLoad ? (
                  <View style={styles.videoLoaderWrap} pointerEvents="none">
                    <ActivityIndicator size="large" color={colors.themeColor} />
                  </View>
                ) : null}
                <Video
                  key={`${String(item.id ?? mediaId ?? id ?? '')}-${changeUrlForData(item.path)}`}
                  onReadyForDisplay={() => setVideoLoad(false)}
                  source={{uri: changeUrlForData(item.path)}}
                  style={[
                    styles.postVideo,
                    {
                      top: VIDEO_INSET_TOP,
                      left: VIDEO_INSET_X,
                      right: VIDEO_INSET_X,
                      bottom: VIDEO_INSET_BOTTOM,
                    },
                  ]}
                  resizeMode="cover"
                  repeat
                  paused={false}
                  muted={!!muteInlineVideo}
                  playInBackground={false}
                  playWhenInactive={false}
                  useTextureView={Platform.OS === 'android'}
                  onBuffer={res => {
                    if (res?.isBuffering) {
                      setVideoLoad(true);
                    }
                  }}
                  ignoreSilentSwitch="ignore"
                />
              </>
            ) : (
              <Pressable
                style={styles.mediaInnerFill}
                onPress={() => onMediaPress?.(item, index)}>
                <View style={styles.videoPoster}>
                  <ActivityIndicator size="small" color={colors.themeColor} />
                </View>
              </Pressable>
            )}
            {(onMediaPress || handleVideoPause) && shouldPlayVideo ? (
              <Pressable
                style={styles.videoTouchOverlay}
                onPress={() => onMediaPress?.(item, index)}
                accessibilityRole="button"
                accessibilityLabel="Open video fullscreen"
              />
            ) : null}
          </View>
        ) : (
          <Pressable
            style={styles.mediaInnerFill}
            onPress={() => onMediaPress?.(item, index)}>
            <CustomImage
              source={{uri: changeUrlForData(item.path)}}
              style={styles.postImage}
            />
          </Pressable>
        )}
      </View>
    );
  };

  // console.log('=-=-=', changeUrlForData(postImage));
  // console.log('=-=-=', postImage);

  return (
    <Pressable onPress={onCardPress}>
      <Card
        style={[
          styles.card,
          postImage && mediaType === 'video' && styles.cardVideoSpacing,
        ]}>
        <View style={styles.cardCompositingLayer} collapsable={false}>
        
        {/* Header section - ALWAYS visible at the top */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity disabled={myAccount} onPress={goToProfile}>
              <CustomImage
                source={
                  avatar && !error
                    ? {uri: changeUrlForData(avatar)}
                    : images.defaultDp
                }
                style={styles.avatar}
                onError={() => setError(true)}
              />
            </TouchableOpacity>
            <View>
              <InterBold style={styles.name}>{name}</InterBold>
              <InterRegular style={styles.time}>
                {country ? `${country}    ` : ''}{time}
              </InterRegular>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton} onPress={onDotPress}>
            <MoreVertical color="#000" size={20} />
          </TouchableOpacity>
        </View>

        {/* Post text content */}
        {(postText || sharedFromName) && (
          <View style={styles.postContent}>
            {postText ? (
              <Text
                style={styles.postText}
                numberOfLines={showFullText ? undefined : 2}>
                {postText}
                {postText.length > maxTextLength && !showFullText && (
                  <Text style={styles.readMoreText} onPress={handleReadMoreToggle}>
                    ...Read More
                  </Text>
                )}
              </Text>
            ) : null}
            {sharedFromName ? (
              <Text style={styles.sharedFromText}>
                {t('sharedFrom', {name: sharedFromName})}
              </Text>
            ) : null}
          </View>
        )}

        {/* Post media section */}
        {resolvedMediaList.length > 0 ? (
          <View
            style={styles.mediaContainer}
            collapsable={false}
            onLayout={event => {
              const width = event.nativeEvent.layout.width;
              if (width > 0) {
                setMediaSlideWidth(width);
              }
            }}>
            {resolvedMediaList.length > 1 ? (
              <>
                <FlatList
                  horizontal
                  pagingEnabled
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  data={resolvedMediaList}
                  keyExtractor={(item, index) =>
                    `${item.id ?? index}-${item.path}`
                  }
                  renderItem={({item, index}) => renderMediaSlide(item, index)}
                  onMomentumScrollEnd={handleCarouselScrollEnd}
                  getItemLayout={(_, index) => ({
                    length: mediaSlideWidth,
                    offset: mediaSlideWidth * index,
                    index,
                  })}
                />
                <View style={styles.mediaPagination} pointerEvents="none">
                  {resolvedMediaList.map((item, index) => (
                    <View
                      key={`${item.id ?? index}-dot`}
                      style={[
                        styles.mediaDot,
                        index === activeMediaIndex && styles.mediaDotActive,
                      ]}
                    />
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.mediaTouchable} collapsable={false}>
                {renderMediaSlide(resolvedMediaList[0], 0)}
              </View>
            )}
          </View>
        ) : null}

        {/* Post interactions */}
        <View style={styles.textPostActions}>
            <View style={styles.countsRow}>
              <View style={styles.countsLeft}>
                <Heart color="#FF3B30" size={16} fill="#FF3B30" />
                <Text style={styles.countText}>{numberLikes}</Text>
                
                <MessageCircle color="#65676B" size={16} style={styles.countIconMargin} />
                <Text style={styles.countText}>{comments}</Text>
                
                <CornerUpRight color="#65676B" size={16} style={styles.countIconMargin} />
                <Text style={styles.countText}>{share}</Text>
              </View>
              <TouchableOpacity onPress={onSavePress}>
                <Bookmark
                  color={isSaved ? colors.blue : '#65676B'}
                  size={18}
                  fill={isSaved ? colors.blue : 'transparent'}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <ThumbsUp color={isLiked ? colors.blue : '#65676B'} size={20} />
                <Text style={styles.actionText}>Like</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={onCommnetPress}>
                <MessageCircle color="#65676B" size={20} />
                <Text style={styles.actionText}>Comment</Text>
              </TouchableOpacity>

              {!myAccount && (
                <TouchableOpacity style={styles.actionButton} onPress={handleOpenShareModal}>
                  <CornerUpRight color="#65676B" size={20} />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              )}
            </View>
        </View>

        </View>
      </Card>

      {modalVisible && (
        <ReportBlockModal
          isVisible={modalVisible}
          options={options}
          onClose={onDotPress}
          style={{top: 45}}
        />
      )}

      {shareModalVisible ? (
        <ShareModal
          visible={shareModalVisible}
          onClose={() => setShareModalVisible(false)}
          onShareToNewsfeed={() => {
            setShareModalVisible(false);
            postShare();
          }}
          onSendToChats={selectedIds => {
            setShareModalVisible(false);
            console.log('Sending to chats:', selectedIds);
          }}
        />
      ) : null}
    </Pressable>

  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: vh * 1,
    marginBottom: vh * 1,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  /** Extra gap after video posts — native layers can still “peek” at row boundaries. */
  cardVideoSpacing: {
    marginBottom: vh * 3.5,
  },
  cardCompositingLayer: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  textPostActions: {
    paddingBottom: 5,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },

  countsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  countsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    color: '#65676B',
    marginLeft: 5,
  },
  countIconMargin: {
    marginLeft: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#65676B',
    marginLeft: 8,
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

  // Taller than before (~1.2× screen width) so each clip has a dedicated box; overflow clips native video.
  mediaContainer: {
    position: 'relative',
    height: DEVICE_WIDTH * 0.8,
    overflow: 'hidden',
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  /** Solid band over the bottom of the media stack; catches stray GPU pixels above the next list row. */
  mediaBottomBleedMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: Math.max(10, Math.round(12 / PixelRatio.get())),
    backgroundColor: '#000',
    zIndex: 8,
  },
  /** Hides a strip of “foreign” frame sometimes painted at the top of the next list row. */
  mediaTopBleedMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: Math.max(6, Math.round(8 / PixelRatio.get())),
    backgroundColor: '#000',
    zIndex: 8,
  },
  mediaTouchable: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  mediaSlide: {
    height: '100%',
    overflow: 'hidden',
  },
  mediaPagination: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 4,
  },
  mediaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  mediaDotActive: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mediaInnerFill: {
    width: '100%',
    height: '100%',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#65676B',
    marginTop: 2,
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
    borderRadius: 10,
  },
  /** Position absolute; insets applied in JSX to trim decode/scaling bleed at edges. */
  postVideo: {
    position: 'absolute',
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
    resizeMode: 'contain',
  },
  sideCount: {
    color: '#fff',
    fontSize: fontSizes.f12,
    marginTop: 4,
  },
  postContent: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 10,
  },
  postText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  sharedFromText: {
    fontSize: fontSizes.f12,
    color: colors.lightGrey,
    marginTop: 6,
    fontStyle: 'italic',
  },
  readMoreText: {
    color: '#169BD5',
    fontWeight: '500',
  },
  videoLoaderWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  videoInlineWrap: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  videoTouchOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  videoPoster: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E4E6EB',
  },
});

export default PostComponent;
