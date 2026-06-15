import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Trash2} from 'lucide-react-native';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import {EmptyComponent} from '../../components/EmptyComponent';
import Loader from '../../components/Loader';
import {selectUserProfile} from '../../store/slices/authSlice';
import {PostDraftMeta} from '../../types/postDraft';
import dayjs from 'dayjs';
import {Toast} from '../../utils/helpers';
import {
  deletePostDraft,
  listPostDrafts,
} from '../../utils/postDrafts';
import styles from './styles';
import {useTranslation} from 'react-i18next';

const PostDrafts: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useSelector(selectUserProfile);
  const {t} = useTranslation();
  const [drafts, setDrafts] = useState<PostDraftMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDrafts = useCallback(async () => {
    if (!user?.id) {
      setDrafts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const items = await listPostDrafts(user.id);
      setDrafts(items);
    } catch {
      Toast.error(t('draftLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadDrafts();
    }, [loadDrafts]),
  );

  const handleContinue = (draft: PostDraftMeta) => {
    if (draft.kind === 'create') {
      navigation.navigate('CreatePost', {draftId: draft.id});
      return;
    }

    navigation.navigate('CreatePostEdit', {
      draftId: draft.id,
      title: 'Edit Post',
      data: {
        id: draft.postId,
        description: draft.preview,
        privacy: '1',
        media: [],
      },
    });
  };

  const handleDelete = (draft: PostDraftMeta) => {
    Alert.alert(t('deleteDraft'), t('deleteDraftConfirm'), [
      {text: t('cancel'), style: 'cancel'},
      {
        text: t('deleteDraft'),
        style: 'destructive',
        onPress: async () => {
          if (!user?.id) {
            return;
          }
          try {
            await deletePostDraft(user.id, draft.id);
            await loadDrafts();
            Toast.success(t('draftDeleted'));
          } catch {
            Toast.error(t('error'));
          }
        },
      },
    ]);
  };

  const renderItem = ({item}: {item: PostDraftMeta}) => {
    const badgeLabel =
      item.kind === 'create'
        ? t('draftNewPost')
        : t('draftEditPost', {id: item.postId ?? ''});

    return (
      <TouchableOpacity
        style={styles.draftRow}
        activeOpacity={0.75}
        onPress={() => handleContinue(item)}>
        {item.thumbnailUri ? (
          <Image source={{uri: item.thumbnailUri}} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailPlaceholderText}>Aa</Text>
          </View>
        )}
        <View style={styles.draftBody}>
          {item.preview ? (
            <Text style={styles.draftPreview} numberOfLines={2}>
              {item.preview}
            </Text>
          ) : (
            <Text style={styles.draftPreviewEmpty} numberOfLines={1}>
              {t('draftNoText')}
            </Text>
          )}
          <View style={styles.draftMetaRow}>
            <Text style={styles.draftBadge}>{badgeLabel}</Text>
            <Text style={styles.draftTime}>
              {dayjs(item.updatedAt).format('MMM DD, YYYY hh:mm A')}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Trash2 color="#E53935" size={20} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={drafts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          drafts.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={<EmptyComponent text={t('noDrafts')} />}
      />
    </View>
  );
};

export default PostDrafts;
