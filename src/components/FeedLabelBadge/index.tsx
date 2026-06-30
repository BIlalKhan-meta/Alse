import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import InterBold from '../Text/InterBold';
import {FeedLabelType} from '../../utils/feedLabels';

type FeedLabelBadgeProps = {
  label: FeedLabelType;
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 0.6,
  },
  newBadge: {
    backgroundColor: '#E8F5E9',
  },
  newBadgeText: {
    color: '#2E7D32',
  },
  followingBadge: {
    backgroundColor: '#E3F2FD',
  },
  followingBadgeText: {
    color: '#1565C0',
  },
  recommendedBadge: {
    backgroundColor: '#F3E5F5',
  },
  recommendedBadgeText: {
    color: '#6A1B9A',
  },
});

const getLabelConfig = (label: FeedLabelType) => {
  switch (label) {
    case 'following':
      return {
        container: styles.followingBadge,
        text: styles.followingBadgeText,
        testID: 'feed-label-following',
        translationKey: 'feed.labelFollowing',
      };
    case 'recommended':
      return {
        container: styles.recommendedBadge,
        text: styles.recommendedBadgeText,
        testID: 'feed-label-recommended',
        translationKey: 'feed.labelRecommended',
      };
    case 'new':
    default:
      return {
        container: styles.newBadge,
        text: styles.newBadgeText,
        testID: 'feed-label-new',
        translationKey: 'feed.labelNew',
      };
  }
};

const FeedLabelBadge: React.FC<FeedLabelBadgeProps> = ({label}) => {
  const {t} = useTranslation();
  const config = getLabelConfig(label);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.badge, config.container]} testID={config.testID}>
        <InterBold style={[styles.badgeText, config.text]}>
          {t(config.translationKey)}
        </InterBold>
      </View>
    </View>
  );
};

export default FeedLabelBadge;
