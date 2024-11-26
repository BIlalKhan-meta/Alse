import React, {useState, useLayoutEffect, useCallback} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import FilterModal from '../../components/FilterModal';
import styles from './styles';
import {images} from '../../utils/images';
import Card from '../../components/Card';
import InterMedium from '../../components/Text/InterMedium';
import InterRegular from '../../components/Text/InterRegular';
import {colors} from '../../utils/theme';
import {GetSubscriptionsLogs} from '../../api/subscription';
import moment from 'moment';
import Loader from '../../components/Loader';
import CustomButton from '../../components/CustomButton';
import { vw } from '../../constant';

const SubscriptionLogs: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
  const [subscriptionLogs, setSubscriptionLogs] = useState();
  const [pastSubscriptionLogs, setPastSubscriptionLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const getApi = async () => {
    setLoading(true);
    const res = await GetSubscriptionsLogs()
      .then(res => {
        if (res?.data) {
          if (res?.data?.data?.current) {
            setSubscriptionLogs(res?.data?.data?.current);
          } else {
            setPastSubscriptionLogs(res?.data?.data?.past);
          }
        }
      })
      .catch(err =>
        console.log('SUBSCRIPTIONNNNNNNNNNNNNNNNNNNNNN', err?.message),
      )
      .finally(() => {
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      getApi();
    }, []),
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <InterRegular style={styles.emptyText}>
        No Subscription to Show.
      </InterRegular>
      <CustomButton style={{width: vw * 80, alignSelf:'center'}}  
           onPress={() => navigation.navigate('SubscriptionPlan')}>Subscribe Now</CustomButton>
    </View>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
    });
  }, [navigation]);

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            activeTab === 'current' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('current')}>
          <InterMedium
            style={[
              styles.sortLabel,
              activeTab === 'current' && styles.activelabel,
            ]}>
            Current Subscription
          </InterMedium>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}>
          <InterMedium
            style={[
              styles.sortLabel,
              activeTab === 'past' && styles.activelabel,
            ]}>
            Past Subscription
          </InterMedium>
        </TouchableOpacity>
      </View>

      {activeTab == 'current' ? (
        <>
          {subscriptionLogs ? (
            <Card style={styles.card}>
              <View style={styles.topHead}>
                <InterMedium style={styles.heading}>
                  Subscription Type
                </InterMedium>
                <InterMedium style={styles.heading}>
                  $ {subscriptionLogs?.price}
                </InterMedium>
              </View>
              <View style={styles.topHead}>
                <InterRegular style={styles.value}>
                  {subscriptionLogs?.plan_name}
                </InterRegular>
                <InterRegular style={styles.value}>{null}</InterRegular>
              </View>

              <View style={styles.topHead}>
                <InterMedium style={styles.heading}>Subscribed On</InterMedium>
                {activeTab !== 'past' && (
                  <InterMedium style={styles.heading}>Expires On</InterMedium>
                )}
              </View>
              <View style={styles.topHead}>
                <InterRegular style={styles.value}>
                  {subscriptionLogs?.date}
                </InterRegular>
                {activeTab !== 'past' && (
                  <InterRegular style={styles.value}>
                    {moment(subscriptionLogs?.end_at).format('YYYY-MM-DD')}
                  </InterRegular>
                )}
              </View>
            </Card>
          ) : (
          renderEmpty()
           )} 
        </>
      ) : (
        <FlatList
          data={pastSubscriptionLogs}
          renderItem={({item}) => (
            <Card style={styles.card}>
              <View style={styles.topHead}>
                <InterMedium style={styles.heading}>
                  Subscription Type
                </InterMedium>
                <InterMedium style={styles.heading}>
                  $ {item?.price}
                </InterMedium>
              </View>
              <View style={styles.topHead}>
                <InterRegular style={styles.value}>
                  {item?.plan_name}
                </InterRegular>
                <InterRegular style={styles.value}>{null}</InterRegular>
              </View>

              <View style={styles.topHead}>
                <InterMedium style={styles.heading}>Subscribed On</InterMedium>
                {activeTab !== 'past' && (
                  <InterMedium style={styles.heading}>Expires On</InterMedium>
                )}
              </View>
              <View style={styles.topHead}>
                <InterRegular style={styles.value}>{item?.date}</InterRegular>
                {activeTab !== 'past' && (
                  <InterRegular style={styles.value}>
                    {moment(item?.end_at).format('YYYY-MM-DD')}
                  </InterRegular>
                )}
              </View>
            </Card>
          )}
          keyExtractor={item => item?.id?.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
};

export default SubscriptionLogs;
