import React, {useState} from 'react';
import {View, ScrollView, Text, Switch} from 'react-native';
import styles from './styles';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useAppTranslation} from '../../i18n/hooks/useAppTranslation';
import GlobalHeader from '../../components/GlobalHeader';
import {colors} from '../../utils/theme';

const NotificationsSettings = () => {
  // TODO need to fetch Social activity settings from slice and display
  const user = useSelector(selectUserProfile);
  const {t} = useAppTranslation();

  const [like, setLike] = useState(true);
  const [comment, setComment] = useState(true);
  const [follows, setFollows] = useState(true);
  const [newPosts, setNewPosts] = useState(true);
  const [auctionUpdates, setAuctionUpdates] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <View style={{paddingHorizontal: 16, paddingTop: 6}}>
          <Text style={{fontSize: 18, fontWeight: '700', color: colors.black}}>
            {t('Notification')}
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          {/* Like */}
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>{t('Like')}</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={like}
                onValueChange={setLike}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={'#E5E7EB'}
              />
            </View>
          </View>
          

          {/* Comment */}
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>{t('Comment')}</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={comment}
                onValueChange={setComment}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={'#E5E7EB'}
              />
            </View>
          </View>
          

          {/* Follows */}
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>{t('Follows')}</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={follows}
                onValueChange={setFollows}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={'#E5E7EB'}
              />
            </View>
          </View>
          

          {/* New posts from followed stores */}
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>
              {t('New posts from followed stores')}
            </Text>
            <View style={styles.switchContainer}>
              <Switch
                value={newPosts}
                onValueChange={setNewPosts}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={'#E5E7EB'}
              />
            </View>
          </View>
          

          {/* Auction updates */}
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>{t('Auction updates')}</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={auctionUpdates}
                onValueChange={setAuctionUpdates}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor={'#E5E7EB'}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsSettings;
