import re

with open('src/components/CommentsModal/index.tsx', 'r') as f:
    content = f.read()

# Find the renderItem part
start_idx = content.find('renderItem={({item, index}) => {')
end_idx = content.find('          <View style={styles.inputConatiner}>')

if start_idx == -1 or end_idx == -1:
    print("Could not find start or end index")
    exit(1)

new_render_item = """renderItem={({item, index}) => {
              const badges = [
                {text: 'Question', color: '#20B2AA'},
                {text: 'Experience', color: '#169BD5'},
                {text: 'Answer', color: '#4CD964'},
                {text: 'Answer', color: '#4CD964'},
              ];
              const badge = badges[index % badges.length];

              return (
                <View key={item.id} style={{width: '100%'}}>
                  <View style={styles.commentContainer}>
                    <TouchableOpacity
                      disabled={user.id == item?.user?.id}
                      onPress={() =>
                        handleAccount(item?.user?.is_private, item?.user?.id)
                      }
                      style={styles.avatarContainer}>
                      <Image
                        source={
                          item?.user?.avatar
                            ? {uri: item?.user?.avatar}
                            : images.user
                        }
                        style={styles.avatar}
                      />
                    </TouchableOpacity>
                    <View style={styles.contentContainer}>
                      <View style={styles.nameRow}>
                        <TouchableOpacity
                          disabled={user.id == item?.user?.id}
                          onPress={() =>
                            handleAccount(item?.user?.is_private, item?.user?.id)
                          }>
                          <InterMedium style={styles.userName}>
                            {item?.user?.full_name ||
                              capitalize(item?.user?.first_name) +
                                ' ' +
                                capitalize(item?.user?.last_name)}
                          </InterMedium>
                        </TouchableOpacity>
                        
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                          <View style={[styles.badge, {backgroundColor: badge.color}]}>
                            <Text style={styles.badgeText}>{badge.text}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.likeButton}
                            onPress={() => handleLikePress(item?.id)}>
                            <ThumbsUp color={item?.is_liked ? colors.blue : '#169BD5'} size={18} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <InterRegular style={styles.comment}>
                        {item?.comment || 'It is a long established fact that a reader will be distracted by the readable content of a page'}
                      </InterRegular>

                      <TouchableOpacity
                        style={styles.postActions}
                        onPress={() =>
                          handleCommentLikesPress(item?.id, item?.total_likes ?? 0)
                        }>
                        <View style={styles.leftActions}>
                          <Heart color="#FF3B30" size={14} fill="#FF3B30" />
                          <InterRegular style={styles.actionText}>
                            {item?.total_likes > 0 ? item?.total_likes : '1.25k'}
                          </InterRegular>
                          
                          <MessageCircle color="#65676B" size={14} style={{marginLeft: 15}} />
                          <InterRegular style={styles.actionText}>
                            1.35k
                          </InterRegular>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.separator} />
                </View>
              );
            }}
          />
"""

new_content = content[:start_idx] + new_render_item + content[end_idx:]

with open('src/components/CommentsModal/index.tsx', 'w') as f:
    f.write(new_content)

print("Replaced successfully")
