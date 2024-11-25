// Home.tsx
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Card from '../../components/Card';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import styles from './styles';
import WishlistScreen from '../../components/WishList';
import SearchComponent from '../../components/SearchComponent';
import CustomButton from '../../components/CustomButton';
import {getAllShop} from '../../api/shop';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import Loader from '../../components/Loader';
import {Subscribe} from '../../components/Subscribe';

const Marketplace: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const [filteredData, setFilteredData] = useState([]);

  const handleSearch = (query: string) => {
    let filtered = shops.filter((item: any) =>
      item?.shop_name?.includes(query),
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    getData();
  }, [isFocused]);

  useEffect(() => {
    const filterOrders = () => {
      let filtered = [...shops];
      setFilteredData(filtered);
    };

    filterOrders();
  }, [shops]);

  const getData = async () => {
    setLoading(true);

    const res = await getAllShop();
    setLoading(false);

    setShops(res.data?.data?.data);
  };

  if (!user?.has_subscription && !user.is_child) {
    return <Subscribe />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Card>
        <SearchComponent onSearch={handleSearch} placeholder="Find shop" />
        <WishlistScreen
          wishlist={filteredData}
          onPress={(shopId, userId) => {
            if (user.id == userId) {
              navigation.navigate('MyShop', {shopId});
            } else {
              navigation.navigate('Shop', {shopId});
            }
          }}
        />
        <CustomButton
          style={styles.button}
          onPress={() => navigation.navigate('AddStore')}>
          Create Shop/My Shop
        </CustomButton>
      </Card>
    </View>
  );
};

export default Marketplace;
