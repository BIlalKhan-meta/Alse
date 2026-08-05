import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import GlobalHeader from '../../components/GlobalHeader';
import {colors} from '../../utils/theme';
import {getCampaignStats} from '../../api/advertising';
import {Toast, getMessage} from '../../utils/helpers';

const CampaignStats: React.FC = () => {
  const route = useRoute<any>();
  const campaignId = Number(route.params?.campaignId);
  const title = route.params?.title || 'Campaign Stats';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Record<string, any> | null>(null);

  const load = useCallback(async () => {
    if (!campaignId) {
      setLoading(false);
      return;
    }
    try {
      const res = await getCampaignStats(campaignId);
      setStats(res?.data?.data || null);
    } catch (err: any) {
      Toast.error(getMessage(err?.response?.data ?? err?.message ?? err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [campaignId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const rows = stats
    ? [
        ['Status', stats.status],
        ['Impressions', stats.impressions],
        ['Clicks', stats.clicks],
        ['CTR', `${stats.ctr ?? 0}%`],
        ['Budget', stats.budget],
        ['Remaining', stats.remaining_budget],
        ['Daily spent', stats.daily_spent],
        ['Purchases', stats.purchases],
        ['Revenue', stats.revenue_generated],
      ]
    : [];

  return (
    <View style={styles.container}>
      <GlobalHeader icon title={title} />
      {loading ? (
        <ActivityIndicator style={{marginTop: 40}} color={colors.themeColor} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }>
          {rows.map(([label, value]) => (
            <View key={String(label)} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{String(value ?? '—')}</Text>
            </View>
          ))}
          {!stats && (
            <Text style={styles.empty}>No stats available yet.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {padding: 16},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  label: {color: '#6B7280', fontSize: 14},
  value: {color: colors.black, fontSize: 14, fontWeight: '600'},
  empty: {textAlign: 'center', marginTop: 40, color: '#6B7280'},
});

export default CampaignStats;
