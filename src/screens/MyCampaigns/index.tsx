import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import GlobalHeader from '../../components/GlobalHeader';
import {colors} from '../../utils/theme';
import {
  listCampaigns,
  pauseCampaign,
  resumeCampaign,
  submitCampaign,
} from '../../api/advertising';
import {Toast, getMessage} from '../../utils/helpers';

type Campaign = {
  id: number;
  title: string;
  status: string;
  budget?: number;
  remaining_budget?: number;
  campaign_type?: string;
  impressions?: number;
  clicks?: number;
};

const MyCampaigns: React.FC = () => {
  const navigation = useNavigation<any>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await listCampaigns({per_page: 50});
      const payload = res?.data?.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      setCampaigns(list);
    } catch (err: any) {
      Toast.error(getMessage(err?.response?.data ?? err?.message ?? err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const runAction = async (
    id: number,
    action: 'submit' | 'pause' | 'resume',
  ) => {
    setActionId(id);
    try {
      if (action === 'submit') {
        await submitCampaign(id);
        Toast.success('Submitted for approval');
      } else if (action === 'pause') {
        await pauseCampaign(id);
        Toast.success('Campaign paused');
      } else {
        await resumeCampaign(id);
        Toast.success('Campaign resumed');
      }
      await load();
    } catch (err: any) {
      Toast.error(getMessage(err?.response?.data ?? err?.message ?? err));
    } finally {
      setActionId(null);
    }
  };

  const renderItem = ({item}: {item: Campaign}) => {
    const status = String(item.status || '').toLowerCase();
    return (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('CampaignStats', {
              campaignId: item.id,
              title: item.title,
            })
          }>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            Status: {item.status || '—'}
            {item.campaign_type ? ` · ${item.campaign_type}` : ''}
          </Text>
          <Text style={styles.meta}>
            Budget: {item.budget ?? '—'}
            {item.remaining_budget != null
              ? ` · Remaining: ${item.remaining_budget}`
              : ''}
          </Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          {['draft', 'rejected'].includes(status) ? (
            <TouchableOpacity
              style={styles.actionBtn}
              disabled={actionId === item.id}
              onPress={() => runAction(item.id, 'submit')}>
              <Text style={styles.actionText}>Submit</Text>
            </TouchableOpacity>
          ) : null}
          {status === 'active' ? (
            <TouchableOpacity
              style={styles.actionBtn}
              disabled={actionId === item.id}
              onPress={() => runAction(item.id, 'pause')}>
              <Text style={styles.actionText}>Pause</Text>
            </TouchableOpacity>
          ) : null}
          {status === 'paused' ? (
            <TouchableOpacity
              style={styles.actionBtn}
              disabled={actionId === item.id}
              onPress={() => runAction(item.id, 'resume')}>
              <Text style={styles.actionText}>Resume</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn]}
            onPress={() =>
              navigation.navigate('CampaignStats', {
                campaignId: item.id,
                title: item.title,
              })
            }>
            <Text style={[styles.actionText, styles.secondaryText]}>Stats</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GlobalHeader icon={true} />
      <View style={styles.headerRow}>
        <Text style={styles.heading}>My Campaigns</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateCampaign')}>
          <Text style={styles.createBtnText}>Create</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          style={{marginTop: 40}}
          color={colors.themeColor}
          size="large"
        />
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={colors.themeColor}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No campaigns yet. Create one to advertise.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FBFA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
  },
  createBtn: {
    backgroundColor: colors.themeColor,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  actionBtn: {
    backgroundColor: colors.themeColor,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.themeColor,
  },
  secondaryText: {
    color: colors.themeColor,
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    paddingHorizontal: 24,
  },
});

export default MyCampaigns;
