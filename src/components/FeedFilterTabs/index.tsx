import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {FEED_FILTER_TABS, FeedFilterTab} from '../../utils/feedFilters';
import styles from './styles';

type FeedFilterTabsProps = {
  activeFilter: FeedFilterTab;
  onFilterChange: (filter: FeedFilterTab) => void;
};

const FeedFilterTabs: React.FC<FeedFilterTabsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.container} collapsable={false}>
      {/* RN ScrollView (not RNGH) + single content child avoids ALSE-1D
          HorizontalScrollView multi-child crash during screen transitions. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        directionalLockEnabled
        contentContainerStyle={styles.scrollContent}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {FEED_FILTER_TABS.map(filter => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                testID={`feed-filter-${filter}`}
                accessibilityRole="button"
                accessibilityState={{selected: isActive}}
                activeOpacity={0.7}
                onPress={() => onFilterChange(filter)}
                style={[styles.tab, isActive && styles.tabActive]}>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {t(`feed.filters.${filter}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default FeedFilterTabs;
