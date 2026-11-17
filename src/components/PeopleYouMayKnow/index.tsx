import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import CustomButton from '../CustomButton';
import InterRegular from '../Text/InterRegular';
import InterMedium from '../Text/InterMedium';
import {SuggestedUser, userFollow, userUnFollow} from '../../api/home';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';
import {images} from '../../utils/images';

type Props = {
  users: SuggestedUser[];
  loading?: boolean;
  layout?: 'horizontal' | 'vertical';
  onUsersChange?: (users: SuggestedUser[]) => void;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
};

const PeopleYouMayKnow: React.FC<Props> = ({
  users,
  loading = false,
  layout = 'horizontal',
  onUsersChange,
  onSeeAll,
  showSeeAll = false,
}) => {
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const [pendingIds, setPendingIds] = useState<Record<number, boolean>>({});
  const isHorizontal = layout === 'horizontal';

  const handleFollow = useCallback(
    async (userItem: SuggestedUser) => {
      const id = Number(userItem?.id);
      if (!id || pendingIds[id]) {
        return;
      }
      setPendingIds(prev => ({...prev, [id]: true}));
      try {
        const next = [...users];
        const index = next.findIndex(item => Number(item?.id) === id);
        if (index === -1) {
          return;
        }
        if (userItem?.is_follow_requested || userItem?.is_following) {
          await userUnFollow(id);
          next[index] = {
            ...next[index],
            is_following: false,
            is_follow_requested: false,
          };
        } else {
          await userFollow(id);
          const isPrivate = Boolean(userItem?.is_private);
          next[index] = {
            ...next[index],
            is_following: !isPrivate,
            is_follow_requested: isPrivate,
          };
        }
        onUsersChange?.(next);
      } catch (error) {
        console.warn('[PYMK] follow action failed:', error);
      } finally {
        setPendingIds(prev => {
          const copy = {...prev};
          delete copy[id];
          return copy;
        });
      }
    },
    [onUsersChange, pendingIds, users],
  );

  const followLabel = (item: SuggestedUser) => {
    if (item?.is_follow_requested) {
      return t('requested', {defaultValue: 'Requested'});
    }
    if (item?.is_following) {
      return t('unfollow', {defaultValue: 'Unfollow'});
    }
    return t('follow', {defaultValue: 'Follow'});
  };

  const renderItem = ({item}: {item: SuggestedUser}) => {
    const reason =
      item?.suggestion_reason ||
      t('pymk.suggestedForYou', {defaultValue: 'Suggested for you'});

    if (isHorizontal) {
      return (
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile', {id: item.id})}
            accessibilityRole="button">
            <Image
              source={item?.avatar ? {uri: item.avatar} : images.user}
              style={styles.avatarLarge}
            />
            <InterMedium style={styles.cardName} lines={1}>
              {item?.full_name || item?.username || ''}
            </InterMedium>
            <InterRegular style={styles.cardReason} lines={2}>
              {reason}
            </InterRegular>
          </TouchableOpacity>
          <CustomButton
            onPress={() => handleFollow(item)}
            loading={Boolean(pendingIds[Number(item.id)])}
            loaderSize="small"
            style={styles.cardBtn}
            containerStyle={styles.cardBtnWrap}
            txtstyle={styles.cardBtnTxt}>
            {followLabel(item)}
          </CustomButton>
        </View>
      );
    }

    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.rowIdentity}
          onPress={() => navigation.navigate('Profile', {id: item.id})}
          accessibilityRole="button">
          <Image
            source={item?.avatar ? {uri: item.avatar} : images.user}
            style={styles.avatar}
          />
          <View style={styles.rowText}>
            <InterMedium style={styles.rowName} lines={1}>
              {item?.full_name || item?.username || ''}
            </InterMedium>
            <InterRegular style={styles.rowReason} lines={1}>
              {reason}
            </InterRegular>
          </View>
        </TouchableOpacity>
        <CustomButton
          onPress={() => handleFollow(item)}
          loading={Boolean(pendingIds[Number(item.id)])}
          loaderSize="small"
          style={styles.rowBtn}
          containerStyle={styles.rowBtnWrap}
          txtstyle={styles.cardBtnTxt}>
          {followLabel(item)}
        </CustomButton>
      </View>
    );
  };

  if (!loading && (!users || users.length === 0)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <InterMedium style={styles.title}>
          {t('pymk.title', {defaultValue: 'People you may know'})}
        </InterMedium>
        {showSeeAll && onSeeAll ? (
          <TouchableOpacity onPress={onSeeAll} accessibilityRole="button">
            <InterRegular style={styles.seeAll}>
              {t('seeAll', {defaultValue: 'See all'})}
            </InterRegular>
          </TouchableOpacity>
        ) : null}
      </View>
      {loading && users.length === 0 ? (
        <ActivityIndicator
          size="small"
          color={colors.themeColor}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          horizontal={isHorizontal}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={isHorizontal}
          nestedScrollEnabled
          contentContainerStyle={
            isHorizontal ? styles.horizontalContent : styles.verticalContent
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: vh * 1,
    marginBottom: vh * 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh * 1,
    paddingHorizontal: vw * 1,
  },
  title: {
    fontSize: fontSizes.f16,
    color: colors.black,
  },
  seeAll: {
    fontSize: fontSizes.f13,
    color: colors.themeColor,
  },
  loader: {
    marginVertical: vh * 2,
  },
  horizontalContent: {
    paddingRight: vw * 2,
  },
  verticalContent: {
    paddingBottom: vh * 1,
  },
  card: {
    width: vw * 36,
    marginRight: vw * 3,
    padding: vw * 3,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderColor,
    alignItems: 'center',
  },
  avatarLarge: {
    width: vw * 16,
    height: vw * 16,
    borderRadius: vw * 8,
    alignSelf: 'center',
    marginBottom: vh * 1,
  },
  cardName: {
    fontSize: fontSizes.f13,
    color: colors.black,
    textAlign: 'center',
  },
  cardReason: {
    fontSize: fontSizes.f11,
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: 2,
    minHeight: vh * 3.5,
  },
  cardBtn: {
    minWidth: '100%',
    height: vh * 4,
    marginTop: vh * 0.8,
  },
  cardBtnWrap: {
    marginTop: 0,
    width: '100%',
  },
  cardBtnTxt: {
    fontSize: fontSizes.f12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vh * 1,
  },
  rowIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: vw * 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  rowText: {
    flex: 1,
    marginLeft: vw * 3,
  },
  rowName: {
    fontSize: fontSizes.f14,
    color: colors.black,
  },
  rowReason: {
    fontSize: fontSizes.f12,
    color: colors.darkGray,
    marginTop: 2,
  },
  rowBtn: {
    minWidth: vw * 24,
    height: vh * 4,
  },
  rowBtnWrap: {
    marginTop: 0,
  },
});

export default PeopleYouMayKnow;
