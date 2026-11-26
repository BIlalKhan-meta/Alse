/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
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
import {getCallMessageDisplayText} from '../../utils/callPayload';
import {
  getProductShareDisplayText,
  parseProductShareMessage,
} from '../../utils/productSharePayload';
import {parsePostShareMessage} from '../../utils/postSharePayload';
import {parsePrivateReplyMessage} from '../../utils/privateReplyPayload';
import ChatProductCard from './ChatProductCard';
import ChatPostCard from './ChatPostCard';

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

export const renderSystemMessage: React.FC<SystemMessageProps> = props => (
  <SystemMessage
    {...props}
    containerStyle={{width: '70%', alignSelf: 'center'}}
    textStyle={styles.erroMsg}
  />
);

export function createRenderCustomView(
  navigation: any,
  onOpenSharedPost?: (payload: {
    postId?: number;
    image?: string;
    title?: string;
    author?: string;
  }) => void,
): React.FC<any> {
  const ChatMessageCustomView = ({currentMessage}: any) => {
    const productPayload = parseProductShareMessage(currentMessage?.text);
    if (productPayload) {
      return (
        <ChatProductCard
          payload={productPayload}
          onViewProduct={() =>
            navigation?.navigate?.('ProductView', {
              productId: productPayload.product_id,
            })
          }
        />
      );
    }

    const postPayload = parsePostShareMessage(currentMessage?.text);
    if (postPayload) {
      return (
        <ChatPostCard
          payload={postPayload}
          onPress={() => {
            // Reels from Videos tab → Videos tab with bottom bar.
            if (postPayload.type === 'video_share' && postPayload.video_id) {
              navigation?.navigate?.('TabNavigation', {
                screen: 'Videos',
                params: {videoId: postPayload.video_id},
              });
              return;
            }
            // Newsfeed posts → validate and open the original PostDetail.
            // Legacy image-only shares still fall back to fullscreen media.
            if (postPayload.post_id || postPayload.image) {
              onOpenSharedPost?.({
                postId: postPayload.post_id,
                image: postPayload.image,
                title: postPayload.title,
                author: postPayload.author,
              });
            }
          }}
        />
      );
    }

    return null;
  };
  ChatMessageCustomView.displayName = 'ChatMessageCustomView';
  return ChatMessageCustomView;
}

export type PrivateReplyQuotePressPayload = {
  quote_message_id?: string | number;
  group_chat_id?: string | number;
  group_name?: string;
};

export function createRenderMessageText(): React.FC<MessageTextProps> {
  const ChatMessageText: React.FC<MessageTextProps> = props => {
    const rawText = props.currentMessage?.text;
    if (parseProductShareMessage(rawText) || parsePostShareMessage(rawText)) {
      return null;
    }

    const privateReply = parsePrivateReplyMessage(rawText);
    if (privateReply) {
      const isOwn =
        props.user?._id != null &&
        String(props.currentMessage?.user?._id) === String(props.user._id);

      return (
        <View style={{paddingHorizontal: 8, paddingVertical: 4, maxWidth: 260}}>
          <View
            style={{
              borderLeftWidth: 3,
              borderLeftColor: isOwn ? 'rgba(255,255,255,0.85)' : '#0A7A7A',
              backgroundColor: isOwn
                ? 'rgba(255,255,255,0.2)'
                : 'rgba(0,0,0,0.06)',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 6,
              marginBottom: 6,
            }}>
            <Text
              style={{
                color: isOwn ? colors.white : '#0A7A7A',
                fontSize: 12,
                fontWeight: '700',
                marginBottom: 2,
              }}
              numberOfLines={1}>
              {privateReply.quote_author}
            </Text>
            <Text
              style={{
                color: isOwn ? 'rgba(255,255,255,0.9)' : colors.gray,
                fontSize: 12,
                lineHeight: 16,
              }}
              numberOfLines={3}>
              {privateReply.quote_text || 'Message'}
            </Text>
          </View>
          {privateReply.body ? (
            <Text
              style={{
                color: isOwn ? colors.white : colors.black,
                fontSize: 14,
                lineHeight: 20,
              }}>
              {privateReply.body}
            </Text>
          ) : null}
        </View>
      );
    }

    return (
      <MessageText
        {...props}
        currentMessage={
          props.currentMessage
            ? {
                ...props.currentMessage,
                text: getProductShareDisplayText(
                  getCallMessageDisplayText(rawText),
                ),
              }
            : props.currentMessage
        }
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
  };
  ChatMessageText.displayName = 'ChatMessageText';
  return ChatMessageText;
}

export const renderMessageText = createRenderMessageText();

export function createRenderBubble(
  highlightedMessageId?: string | number | null,
  onPrivateReplyQuotePress?: (
    payload: PrivateReplyQuotePressPayload,
  ) => void,
): React.FC<BubbleProps> {
  const ChatBubble: React.FC<BubbleProps> = props => {
    const isOwn =
      props.user?._id != null &&
      String(props.currentMessage?.user?._id) === String(props.user._id);
    const senderName = props.currentMessage?.user?.name;
    const showSenderName =
      Boolean(props.renderUsernameOnMessage) && !isOwn && Boolean(senderName);
    const isHighlighted =
      highlightedMessageId != null &&
      String(props.currentMessage?._id) === String(highlightedMessageId);
    const privateReply = parsePrivateReplyMessage(
      props.currentMessage?.text,
    );

    return (
      <View>
        {showSenderName ? (
          <Text
            style={{
              color: '#0A7A7A',
              fontSize: 12,
              fontWeight: '600',
              marginLeft: 12,
              marginBottom: 2,
            }}
            numberOfLines={1}>
            {senderName}
          </Text>
        ) : null}
        <Bubble
          {...props}
          renderUsernameOnMessage={false}
          // GiftedChat wraps the bubble in TouchableWithoutFeedback, so nested
          // Touchables never fire — handle quote jump on the bubble press.
          onPress={
            privateReply
              ? () =>
                  onPrivateReplyQuotePress?.({
                    quote_message_id: privateReply.quote_message_id,
                    group_chat_id: privateReply.group_chat_id,
                    group_name: privateReply.group_name,
                  })
              : props.onPress
          }
          wrapperStyle={{
            left: {
              backgroundColor: isHighlighted ? '#C8E6C9' : '#E8F5E8',
              marginVertical: vh * 0.5,
              marginHorizontal: 4,
              borderRadius: 18,
              paddingHorizontal: 4,
              borderWidth: isHighlighted ? 2 : 0,
              borderColor: isHighlighted ? '#FFC107' : 'transparent',
            },
            right: {
              backgroundColor: isHighlighted ? '#26C6DA' : '#00BCD4',
              marginVertical: vh * 0.5,
              marginHorizontal: 4,
              borderRadius: 18,
              paddingHorizontal: 4,
              borderWidth: isHighlighted ? 2 : 0,
              borderColor: isHighlighted ? '#FFC107' : 'transparent',
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
      </View>
    );
  };
  ChatBubble.displayName = 'ChatBubble';
  return ChatBubble;
}

export const renderBubble = createRenderBubble();

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
