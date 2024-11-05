// PostComponent.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  Pressable,
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

interface PostProps {
  id?: number;
  postID?: number;
  avatar: string;
  name: string;
  country: string;
  time: string;
  postText: string;
  postImage: string;
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
  modalVisible: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
  onCardPress:() => void
}

const PostComponent: React.FC<PostProps> = ({
  postID,
  id,
  avatar,
  name,
  country,
  time,
  postText,
  postImage,
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
  onCardPress
}) => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);

  const [showFullText, setShowFullText] = useState(false);
  const maxTextLength = 100;

  const myAccount = user?.id == id ? true : false;

  const goToProfile = () => {
    // if (myAccount) {
    //   navigation.navigate('MyProfile', { account });

    // } else if (account) {

    //   navigation.navigate('Profile', { account, id });
    // }
    navigation.navigate('Profile', {account, id});
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

  return (
    <Pressable onPress={onCardPress}>
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <TouchableOpacity disabled={myAccount} onPress={goToProfile}>
            <Image
              source={avatar ? {uri: avatar} : images.user}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View>
            <InterBold style={styles.name}>{name}</InterBold>
            <View style={styles.userMeta}>
              <InterRegular style={styles.country}>{country}</InterRegular>
              <InterRegular style={styles.time}> · {time}</InterRegular>
            </View>
          </View>
        </View>
        <TouchableOpacity style={{padding: vh}} onPress={onDotPress}>
          <Image source={images.dots} style={styles.threeDots} />
        </TouchableOpacity>
      </View>

      {/* <InterLight style={styles.postText}>{postText}</InterLight> */}
      <View style={styles.postContent}>{renderPostText()}</View>
      {postImage && (
        <Image source={{uri: postImage}} style={styles.postImage} />
      )}
      <View style={styles.postActions}>
        <View style={styles.leftActions}>
          <Image
            // source={images.like}
            source={images.likeFill}
            tintColor={colors.blue}
            style={styles.icon}
          />
          <InterRegular style={styles.actionText}>{likes?.length}</InterRegular>
          <Image source={images.comment} style={styles.icon} />
          <InterRegular style={styles.actionText}>
            {comments?.length}{' '}
          </InterRegular>
          <Image source={images.share} style={styles.icon} />
          <InterRegular style={styles.actionText}>{share}</InterRegular>
        </View>
        <TouchableOpacity onPress={onSavePress}>
          <Image
            source={isSaved ? images?.unsave : images.save}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.button} onPress={onLikePress}>
          <Image
            // source={images.like}
            source={isLiked ? images.likeFill : images?.like}
            style={styles.buttonIcon}
            tintColor={isLiked ? colors.blue : null}
          />
          <Text style={styles.buttonText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onCommnetPress}>
          <Image source={images.comment} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Image source={images.share} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
      </View>
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
    marginVertical: vh * 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh * 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: fontSizes.f16,
    color: colors.black,
    fontWeight: 'bold',
  },
  userMeta: {
    flexDirection: 'row',
  },
  country: {
    fontSize: fontSizes.f12,
    color: colors.lightGrey,
  },
  time: {
    fontSize: fontSizes.f12,
    color: colors.lightGrey,
  },
  threeDots: {
    width: vh * 2,
    height: vh * 2,
    resizeMode: 'contain',
  },

  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  actionText: {
    marginRight: 20,
    fontSize: fontSizes.f12,
    color: colors.inputText,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  buttonText: {
    fontSize: fontSizes.f14,
    color: colors.inputText,
  },
  postText: {
    fontSize: fontSizes.f14,
    // marginBottom: 10,
    color: colors.inputText,
  },
  postContent: {
    // marginVertical: 10,
    marginBottom: vh * 2,
  },

  readMoreText: {
    color: colors.themeColor,
    // marginTop: 5,
  },
});

export default PostComponent;
