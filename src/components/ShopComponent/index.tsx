import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import styles from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import WishlistScreen from '../WishList';
import {getSimilarProducts, productDetail} from '../../api/product';
import Loader from '../Loader';

const ShopComponent: React.FC = ({id}) => {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);

  const getData = async () => {
    setLoader(true);
    await getSimilarProducts(id).then(res => {
      if (res?.data) {
        setData(res?.data?.data);
        setLoader(false);
      }
    });
  };

  useEffect(() => {
    if (id) {
      getData();
    }
  }, []);

  if (loader) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <WishlistScreen
          wishlist={data}
          heart={true}
          addCart={true}
          product={true}
          // handleRemove={handleRemoveFromWishlist}
          onPress={id => {
            navigation.navigate('ProductView', {productId: id});
          }}
        />
      </View>
    </View>
  );
};

export default ShopComponent;
