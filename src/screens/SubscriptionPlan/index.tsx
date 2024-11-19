import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, Dimensions, ScrollView, Linking} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import styles from './styles';
import CustomButton from '../../components/CustomButton';
import Card from '../../components/Card';
import {vh, vw} from '../../constant';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {GetSubscriptions, makePayment} from '../../api/subscription';
import {getMessage} from '../../utils/helpers';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {GetUserProfile} from '../../store/slices/authSlice';
import Loader from '../../components/Loader';
import Toast from 'react-native-toast-message';
import eventEmitter, {EVENT_TYPES} from '../../utils/EventEmitter';
import {useAppDispatch} from '../../hooks/storeHooks';

const {width: viewportWidth} = Dimensions.get('window');

const SubscriptionPlan: React.FC = () => {
  const navigation = useNavigation();
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const getApi = async () => {
    setLoading(true);
    await GetSubscriptions()
      .then(res => {
        if (res?.data) {
          setSubscriptionPlans(res?.data?.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      getApi();
    }, []),
  );
  const TriggerFunc = async () => {
    setLoading(true);
    await dispatch(GetUserProfile());
    setLoading(false);
  };
  useEffect(() => {
    eventEmitter.on(EVENT_TYPES.CHECKOUT_TRIGGER, TriggerFunc);

    return () => {
      eventEmitter.off(EVENT_TYPES.CHECKOUT_TRIGGER, TriggerFunc);
    };
  }, []);

  if (loading) {
    return <Loader />;
  }

  const sleep = async timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  const openLink = async url => {
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url);
        if (result) {
          loadData();
        }
        await sleep(800);
        console.log('Inappppp result', result);

        if (result?.type === 'dismiss') {
          loadData();
        }
        // if (isSubscribed) {
        //   navigate('DrawerNavigation1');
        // }
        // RNRestart.restart();
      } else Linking.openURL(url);
    } catch (error) {
      Toast.error(getMessage(error?.message));
    }
  };

  const onChoosePlan = async (id: number) => {
    const apiData = {
      plan_id: id,
    };

    let formData = new FormData();

    Object.entries(apiData).forEach(item => {
      formData.append(item[0], item[1]);
    });

    await makePayment(formData)
      .then(res => {
        if (res?.data) {
          if (res?.data?.status) {
            openLink(res?.data?.data?.url);
          } else {
            return Toast.show({
              type: 'success',
              text1: 'Subscription',
              text2: res?.data?.message,
            });
          }
        }
      })
      .catch(err => {
        console.log('ERRORRRRRRRRRRRRR', err);
      });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await GetUserProfile();
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log('Error', e);
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.planDetails}>
      <Text style={styles.planTitle}>{item.name}</Text>
      <Text style={styles.planDescription}> {item.description}</Text>
      <Text style={styles.price}>Price: {item.price}</Text>

      <CustomButton style={styles.button} onPress={() => onChoosePlan(item.id)}>
        Choose Plan
      </CustomButton>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <View style={styles.carasouelContainer}>
          <Carousel
            data={subscriptionPlans}
            renderItem={renderItem}
            sliderWidth={viewportWidth}
            // itemWidth={viewportWidth * 0.6}
            itemWidth={vw * 70}
            layout={'default'}
          />
        </View>
        <CustomButton
          style={styles.logButton}
          onPress={() => navigation.navigate('SubscriptionLogs')}>
          View Subscription Log
        </CustomButton>
      </Card>
    </ScrollView>
  );
};

export default SubscriptionPlan;
