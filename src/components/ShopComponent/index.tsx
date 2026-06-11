import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import styles from './styles';
import {useNavigation} from '@react-navigation/native';
import WishlistScreen from '../WishList';
import {getSimilarProducts} from '../../api/product';
import Loader from '../Loader';

type ShopComponentProps = {
  id?: number | string;
  embedded?: boolean;
};

const ShopComponent: React.FC<ShopComponentProps> = ({id, embedded = false}) => {
  const navigation = useNavigation();
  const [data, setData] = useState<any[]>([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const getData = async () => {
      setLoader(true);
      try {
        const res = await getSimilarProducts(id);
        if (!cancelled && res?.data) {
          setData(Array.isArray(res.data.data) ? res.data.data : []);
        }
      } finally {
        if (!cancelled) {
          setLoader(false);
        }
      }
    };

    getData();

    return () => {
      cancelled = true;
    };
  }, [id]);

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
          embedded={embedded}
          onPress={productItemId => {
            (navigation as any).navigate('ProductView', {
              productId: productItemId,
            });
          }}
        />
      </View>
    </View>
  );
};

export default ShopComponent;
