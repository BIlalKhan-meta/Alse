import re

with open('src/components/PostComponent/index.tsx', 'r') as f:
    content = f.read()

# Add lucide icons import
if 'import {MoreVertical, Heart, MessageCircle, Share, Bookmark, ThumbsUp, CornerUpRight} from \'lucide-react-native\';' not in content:
    content = content.replace('import {useNavigation} from \'@react-navigation/native\';', 'import {useNavigation} from \'@react-navigation/native\';\nimport {MoreVertical, Heart, MessageCircle, Share, Bookmark, ThumbsUp, CornerUpRight} from \'lucide-react-native\';')

# Find the start of the return statement
start_idx = content.find('  return (\n    <Pressable onPress={onCardPress}>')

# Find the end of the return statement (the last `  );` before `};`)
end_idx = content.find('  );\n};\n') + 4

if start_idx == -1 or end_idx == -1:
    print("Could not find start or end index")
    exit(1)

new_return = """  return (
    <Pressable onPress={onCardPress}>
      <Card
        style={[
          styles.card,
          postImage && mediaType === 'video' && styles.cardVideoSpacing,
        ]}>
        <View
          style={styles.cardCompositingLayer}
          collapsable={false}
          {...(postImage && mediaType === 'video'
            ? Platform.OS === 'android'
              ? {renderToHardwareTextureAndroid: true}
              : {needsOffscreenAlphaCompositing: true}
            : {})}>
        
        {/* Header section - ALWAYS visible at the top */}
        <View
          style={[
            styles.header,
            {
              paddingBottom: 10,
            },
          ]}>
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
                {country ? `${country}, ` : ''}{time}
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

        {/* Post image section */}
        {postImage ? (
          <View style={styles.mediaContainer} collapsable={false}>
            <View style={styles.mediaTouchable} collapsable={false}>
              {mediaType === 'image' ? (
                <Pressable style={styles.mediaInnerFill} onPress={onMediaPress}>
                  <CustomImage
                    source={{uri: changeUrlForData(postImage)}}
                    style={styles.postImage}
                  />
                </Pressable>
              ) : (
                <View style={styles.videoInlineWrap} collapsable={false}>
                  {videoLoad ? (
                    <View style={styles.videoLoaderWrap} pointerEvents="none">
                      <ActivityIndicator size="large" color={colors.themeColor} />
                    </View>
                  ) : null}
                  <Video
                    key={`${String(mediaId ?? id ?? '')}-${changeUrlForData(postImage)}`}
                    onReadyForDisplay={() => setVideoLoad(false)}
                    source={{uri: changeUrlForData(postImage)}}
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
                    repeat={true}
                    paused={isPaused}
                    muted={!!muteInlineVideo}
                    useTextureView={Platform.OS === 'android'}
                    onBuffer={res => {
                      if (res?.isBuffering) {
                        setVideoLoad(true);
                      }
                    }}
                    ignoreSilentSwitch={'ignore'}
                  />
                  {(onMediaPress || handleVideoPause) && (
                    <Pressable
                      style={styles.videoTouchOverlay}
                      onPress={onMediaPress ?? handleVideoPause}
                      accessibilityRole="button"
                      accessibilityLabel={
                        onMediaPress
                          ? 'Open video fullscreen'
                          : 'Play or pause video'
                      }
                    />
                  )}
                </View>
              )}
            </View>
          </View>
        ) : null}

        {/* Post interactions */}
        <View style={styles.textPostActions}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E4E6EB'}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Heart color="#FF3B30" size={16} fill="#FF3B30" />
                <Text style={{fontSize: 12, color: '#65676B', marginLeft: 5}}>{numberLikes}</Text>
                
                <MessageCircle color="#65676B" size={16} style={{marginLeft: 15}} />
                <Text style={{fontSize: 12, color: '#65676B', marginLeft: 5}}>{comments}</Text>
                
                <CornerUpRight color="#65676B" size={16} style={{marginLeft: 15}} />
                <Text style={{fontSize: 12, color: '#65676B', marginLeft: 5}}>{share}</Text>
              </View>
              <TouchableOpacity onPress={onSavePress}>
                <Bookmark color="#65676B" size={18} />
              </TouchableOpacity>
            </View>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12}}>
              <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={handleLike}>
                <ThumbsUp color={isLiked ? colors.blue : '#65676B'} size={20} />
                <Text style={{fontSize: 14, color: '#65676B', marginLeft: 8}}>Like</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={onCommnetPress}>
                <MessageCircle color="#65676B" size={20} />
                <Text style={{fontSize: 14, color: '#65676B', marginLeft: 8}}>Comment</Text>
              </TouchableOpacity>

              {!myAccount && (
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={postShare}>
                  <CornerUpRight color="#65676B" size={20} />
                  <Text style={{fontSize: 14, color: '#65676B', marginLeft: 8}}>Share</Text>
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
          style={{top: 55}}
        />
      )}
    </Pressable>
  );"""

new_content = content[:start_idx] + new_return + content[end_idx:]

with open('src/components/PostComponent/index.tsx', 'w') as f:
    f.write(new_content)

print("Replaced successfully")
