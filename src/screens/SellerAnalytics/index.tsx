import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeft} from 'lucide-react-native';
import {getShopAnalytics} from '../../api/shop';
import Loader from '../../components/Loader';
import {colors} from '../../utils/theme';

type AnalyticsData = {
  totals?: {
    orders?: number;
    paid_orders?: number;
    revenue?: number;
    products?: number;
    average_order_value?: number;
  };
  last_30_days?: Array<{date: string; orders: number; revenue: number}>;
  top_products?: Array<{
    product_id: number;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
};

const SellerAnalytics = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const shopId = (route as any)?.params?.shopId;
  const shopName = (route as any)?.params?.shopName || 'Shop Analytics';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!shopId) {
      setError('Missing shop id');
      setLoading(false);
      return;
    }
    try {
      setError('');
      const res = await getShopAnalytics(Number(shopId));
      setData(res?.data?.data || null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shopId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <Loader />;
  }

  const totals = data?.totals || {};
  const series = data?.last_30_days || [];
  const topProducts = data?.top_products || [];
  const maxRevenue = Math.max(...series.map(d => Number(d.revenue) || 0), 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {shopName}
        </Text>
        <View style={{width: 40}} />
      </View>

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
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{totals.orders ?? 0}</Text>
            <Text style={styles.kpiLabel}>Orders</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{totals.paid_orders ?? 0}</Text>
            <Text style={styles.kpiLabel}>Paid</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>
              ${Number(totals.revenue || 0).toFixed(0)}
            </Text>
            <Text style={styles.kpiLabel}>Revenue</Text>
          </View>
        </View>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{totals.products ?? 0}</Text>
            <Text style={styles.kpiLabel}>Products</Text>
          </View>
          <View style={[styles.kpiCard, {flex: 2}]}>
            <Text style={styles.kpiValue}>
              ${Number(totals.average_order_value || 0).toFixed(2)}
            </Text>
            <Text style={styles.kpiLabel}>Avg order value</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Last 30 days</Text>
        <View style={styles.chart}>
          {series.map(day => (
            <View key={day.date} style={styles.barWrap}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(
                      4,
                      (Number(day.revenue) / maxRevenue) * 80,
                    ),
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <Text style={styles.hint}>Bars show daily revenue (paid orders)</Text>

        <Text style={styles.sectionTitle}>Top products</Text>
        {topProducts.length === 0 ? (
          <Text style={styles.empty}>No paid sales yet</Text>
        ) : (
          topProducts.map(product => (
            <View key={`${product.product_id}-${product.product_name}`} style={styles.productRow}>
              <View style={{flex: 1}}>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.product_name || `Product #${product.product_id}`}
                </Text>
                <Text style={styles.productMeta}>
                  Sold {product.quantity_sold} · ${Number(product.revenue || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f8f8'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  backBtn: {width: 40, height: 40, justifyContent: 'center'},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: '#222'},
  content: {padding: 16, paddingBottom: 40},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginTop: 8,
    marginBottom: 12,
  },
  kpiRow: {flexDirection: 'row', gap: 10, marginBottom: 10},
  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  kpiValue: {fontSize: 20, fontWeight: '700', color: colors.themeColor || '#0C959B'},
  kpiLabel: {marginTop: 4, fontSize: 12, color: '#666'},
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 2,
  },
  barWrap: {flex: 1, justifyContent: 'flex-end'},
  bar: {
    width: '100%',
    backgroundColor: colors.themeColor || '#0C959B',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    opacity: 0.85,
  },
  hint: {marginTop: 8, fontSize: 12, color: '#888', marginBottom: 8},
  productRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  productName: {fontSize: 14, fontWeight: '600', color: '#222'},
  productMeta: {marginTop: 4, fontSize: 12, color: '#666'},
  empty: {color: '#888', fontSize: 13},
  error: {color: '#c0392b', marginBottom: 12},
});

export default SellerAnalytics;
