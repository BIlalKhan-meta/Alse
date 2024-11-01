import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import Card from '../../components/Card';
import styles from './styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import InterRegular from '../../components/Text/InterRegular';
import WishlistScreen from '../../components/WishList';
import InterMedium from '../../components/Text/InterMedium';
import ReportBlockModal from '../../components/ReportBlockModal';
import GeneralModal from '../../components/GeneralModal';
import SortModal from '../../components/SortModal';
import {getProductByShop, shopDetail} from '../../api/shop';
import Loader from '../../components/Loader';
import {removeSavedItem, saveItem} from '../../api/menu';

const Shop: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const shopId = route?.params?.shopId;

  const [commentsVisible, setCommentsVisible] = useState<boolean>(false);
  const [active, setActive] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [ReportSuccess, setReportSuccess] = useState(false);
  const [shopDetails, setShopDetails] = useState([]);
  const [shopProduct, setShopProduct] = useState([]);
  const [loading, setLoading] = useState(false);

  // const [modalVisible, setModalVisible] = useState(false);
  const [sortValue, setSortValue] = useState<string>(''); // State for the selected sort value

  const handleSelectSort = (value: string) => {
    setSortValue(value);
    // Implement sorting logic here based on the selected value
  };

  const handleReportPress = () => {
    setModalVisible(false);
    setReportSuccess(true);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setModalVisible(!modalVisible);
          }}>
          <Image source={images.dots} style={styles.threeDots} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, modalVisible]);

  const options = [
    // { text: 'Get Link', onPress: () => { handleGetLink(); } },
    {
      text: 'Report Shop',
      onPress: () => {
        handleReportPress();
      },
    },
    // { text: 'Block', onPress: () => { handleBlockPress(); } },
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    const res = await shopDetail(shopId);
    const res2 = await getProductByShop(shopId);

    setShopDetails(res?.data?.data);
    setShopProduct(res2?.data?.data?.data);
    console.log('====================================');
    console.log(res?.data?.data, '====ressss');
    console.log(res2?.data?.data, '====rssss producttttt');
    console.log('====================================');
    setLoading(false);
  };

  if (loading) {
    return <Loader />;
  }

  const handleRemoveFromWishlist = async (
    productId: number,
    saved: boolean,
  ) => {
    if (saved) {
      await removeSavedItem(productId).then(res => {
        if (res?.data) {
          let index = shopProduct.findIndex(item => item?.id == productId);
          let arr = [...shopProduct];
          arr.splice(index, 1);
          setShopProduct(arr);
        }
      });
    } else {
      const data = {
        item_id: productId,
        item_type: 'product',
      };

      const form = new FormData();
      Object.entries(data).map(([key, value]) => {
        form.append(key, value);
      });

      await saveItem(form)
        .then(res => {
          if (res?.data) {
            //   console.log('RESSSSSSSSSS SAVEEEEEEEEEEEEEEE', res?.data);
          }
        })
        .catch(err => {
          console.log('ERRRRRORRR SAVEEEEEEEEEEEEEEEEE', err);
        });
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View style={styles.container}>
          <ReportBlockModal isVisible={modalVisible} options={options} />

          <Card style={styles.contentContainer}>
            <View style={styles.banner}>
              <Image
                // source={images.shop11}
                source={{uri: shopDetails?.banner}}
                style={styles.imageStyle}
              />
            </View>

            <View style={styles.sortConatiner}>
              <InterMedium style={styles.mainheading}>Shop Name</InterMedium>
              <View>
                <InterRegular style={styles.heading}>Sort by:</InterRegular>
                <View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.sortInput}>
                    <Text style={styles.sortText}>
                      {sortValue || 'Select an option'}
                    </Text>
                  </TouchableOpacity>
                  {/* <Picker
                                        style={[styles.pickercontainer]}
                                        dropdownIconColor={colors.inputText}
                                        enabled={true}
                                        mode='dialog'
                                        placeholder={"Product name (a-z)"}

                                    // onValueChange={handleChange('gender')}
                                    // selectedValue={values.gender}
                                    // data={genders}
                                    >

                                        <Picker.Item label={"Product name (a-z)"} value="" />

                                        {productFilter.map((item) => (
                                            <Picker.Item
                                                label={item.name.toString()}
                                                value={item.name.toString()}
                                                key={item.id.toString()}
                                            />
                                        ))}

                                    </Picker> */}
                </View>
              </View>
            </View>

            <WishlistScreen
              wishlist={shopProduct}
              heart={true}
              addCart={true}
              product={true}
              handleRemove={handleRemoveFromWishlist}
              onPress={id => {
                console.log('====================================');
                console.log(id, 'Id Frommm producttt');
                console.log('====================================');
                navigation.navigate('ProductView', {productId: id});
              }}
            />
          </Card>
          <SortModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSelect={handleSelectSort}
          />
          <GeneralModal
            visible={ReportSuccess}
            closeModal={() => setReportSuccess(false)}
            // icon={images.checkedIcon}
            redImage={true}
            title="Report Shop"
            message="Shop has been reported"
            buttonText="Ok"
            onPress={() => {
              setReportSuccess(false);
            }}
            primaryBtn={true}
          />
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

export default Shop;
