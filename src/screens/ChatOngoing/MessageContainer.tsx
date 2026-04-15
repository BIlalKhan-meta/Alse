/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {
  Bubble,
  MessageText,
  SystemMessage,
  BubbleProps,
  MessageTextProps,
  SystemMessageProps,
  RenderMessageImageProps,
  RenderMessageVideoProps,
} from 'react-native-gifted-chat';
import {Play} from 'lucide-react-native';
import styles from './styles';
import {colors} from '../../utils/theme';
import {vh} from '../../constant';
import {getAbsoluteAvatarUrl} from '../../utils/helpers';

function resolveMessageImageUri(uri: string): string {
  return uri.startsWith('http://') ||
    uri.startsWith('https://') ||
    uri.startsWith('file://') ||
    uri.startsWith('content://')
    ? uri
    : getAbsoluteAvatarUrl(uri) || uri;
}

/** Pass `onOpenFullscreen` to open the image full screen when the user taps it. */
export function createRenderMessageImage(
  onOpenFullscreen: (uri: string) => void,
): React.FC<RenderMessageImageProps<any>> {
  const ChatMessageImage = ({
    currentMessage,
    imageStyle,
  }: RenderMessageImageProps<any>) => {
    const uri = currentMessage?.image;
    if (!uri) return null;
    const resolvedUri = resolveMessageImageUri(uri);
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onOpenFullscreen(resolvedUri)}
        accessibilityRole="button"
        accessibilityLabel="View image full screen">
        <Image
          source={{uri: resolvedUri}}
          style={[
            {
              width: 200,
              height: 150,
              borderRadius: 12,
              margin: 3,
            },
            imageStyle,
          ]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };
  ChatMessageImage.displayName = 'ChatMessageImage';
  return ChatMessageImage;
}

/** Default renderer without fullscreen (tap does nothing). */
export const renderMessageImage = createRenderMessageImage(() => {});

/** Pass `onOpenFullscreen` to open the video in an in-app fullscreen player. */
export function createRenderMessageVideo(
  onOpenFullscreen: (uri: string) => void,
): React.FC<RenderMessageVideoProps<any>> {
  const ChatMessageVideo = ({
    currentMessage,
    ...rest
  }: RenderMessageVideoProps<any>) => {
    const videoUrl = currentMessage?.video;
    if (!videoUrl) return null;
    const absoluteUrl = getAbsoluteAvatarUrl(videoUrl) || videoUrl;
    return (
      <TouchableOpacity
        onPress={() => onOpenFullscreen(absoluteUrl)}
        style={{
          width: 200,
          height: 150,
          backgroundColor: '#333',
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
        accessibilityRole="button"
        accessibilityLabel="Play video full screen"
        {...rest}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Play size={26} color="#fff" fill="#fff" />
        </View>
      </TouchableOpacity>
    );
  };
  ChatMessageVideo.displayName = 'ChatMessageVideo';
  return ChatMessageVideo;
}

/** Default renderer without fullscreen action. */
export const renderMessageVideo = createRenderMessageVideo(() => {});

export const renderBubble: React.FC<BubbleProps> = props => (
  <Bubble
    {...props}
    wrapperStyle={{
      left: {
        backgroundColor: '#E8F5E8',
        marginVertical: vh * 0.5,
        marginHorizontal: 4,
        borderRadius: 18,
        paddingHorizontal: 4,
      },
      right: {
        backgroundColor: '#00BCD4',
        marginVertical: vh * 0.5,
        marginHorizontal: 4,
        borderRadius: 18,
        paddingHorizontal: 4,
      },
    }}
    textStyle={{
      left: {
        color: colors.black,
        fontSize: 14,
      },
      right: {
        color: colors.white,
        fontSize: 14,
      },
    }}
    timeTextStyle={{
      left: {
        color: colors.gray,
        fontSize: 11,
      },
      right: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
      },
    }}
    tickStyle={{
      color: 'rgba(255,255,255,0.8)',
    }}
  />
);

export const renderSystemMessage: React.FC<SystemMessageProps> = props => (
  <SystemMessage
    {...props}
    containerStyle={{width: '70%', alignSelf: 'center'}}
    textStyle={styles.erroMsg}
  />
);

export const renderMessageText: React.FC<MessageTextProps> = props => (
  <MessageText
    {...props}
    containerStyle={{
      left: {
        backgroundColor: 'transparent',
      },
      right: {
        backgroundColor: 'transparent',
      },
    }}
    textStyle={{
      left: {
        color: colors.black,
        fontSize: 14,
        lineHeight: 20,
      },
      right: {
        color: colors.white,
        fontSize: 14,
        lineHeight: 20,
      },
    }}
    linkStyle={{
      left: {
        color: '#00BCD4',
        textDecorationLine: 'underline',
      },
      right: {
        color: colors.white,
        textDecorationLine: 'underline',
      },
    }}
  />
);

// Uncomment and type this if needed
// export const renderCustomView: React.FC<{ user: { name: string } }> = ({ user }) => (
//   <View style={{ minHeight: 20, alignItems: 'center' }}>
//     <Text>
//       Current user:
//       {user.name}
//     </Text>
//     <Text>From CustomView</Text>
//   </View>
// );
