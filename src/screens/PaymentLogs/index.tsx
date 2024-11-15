import React, {useState, useLayoutEffect, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import styles from './styles';
import {images} from '../../utils/images';
import Card from '../../components/Card';
import FilterModal from '../../components/FilterModal';
import InterMedium from '../../components/Text/InterMedium';
import InterRegular from '../../components/Text/InterRegular';
import {colors} from '../../utils/theme';
import {getPaymentLogs} from '../../api/product';
import {dateHelper} from '../../utils';
import Loader from '../../components/Loader';
import {EmptyComponent} from '../../components/EmptyComponent';

const PaymentLogs: React.FC = () => {
  const [data, setData] = useState([]);
  const isFocused = useIsFocused();
  const [loader, setLoader] = useState(false);

  const getData = async () => {
    setLoader(true);
    await getPaymentLogs()
      .then(res => {
        if (res?.data) {
          setData(res?.data?.data?.data);
        }
      })
      .finally(() => {
        setLoader(false);
      });
  };

  useEffect(() => {
    getData();
  }, [isFocused]);

  if (loader) {
    return <Loader />;
  }

  if (data?.length == 0) {
    return <EmptyComponent text={'No Logs Available'} />;
  }

  return (
    <View style={styles.container}>
      <>
        <FlatList
          data={data}
          renderItem={({item}) => (
            <Card style={styles.card}>
              <View style={styles.topHead}>
                <InterMedium style={styles.heading}>Username</InterMedium>
                <InterMedium style={styles.heading}>Amount Paid</InterMedium>
              </View>
              <View style={styles.topHead}>
                <View style={styles.topValue}>
                  <InterRegular style={styles.value}>
                    {item?.user_name}
                  </InterRegular>
                </View>
                <View style={styles.topValue}>
                  <InterRegular style={styles.value}>
                    ${item?.amount}
                  </InterRegular>
                </View>
              </View>

              <View style={styles.topHead}>
                <InterMedium style={styles.heading}>Order Date</InterMedium>
                <InterMedium style={styles.heading}>Order Number</InterMedium>
              </View>
              <View style={styles.topHead}>
                <InterRegular style={styles.value}>
                  {dateHelper(item?.date)}
                </InterRegular>
                <InterRegular style={styles.value}>
                  #{item?.order_id}
                </InterRegular>
              </View>
            </Card>
          )}
          keyExtractor={item => item?.order_id?.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </>
    </View>
  );
};

export default PaymentLogs;
