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
import {getSavedItems, removeSavedItem, saveItem} from '../../api/menu';
import DropdownPicker from '../../components/DropdownPicker';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import Row from '../../components/Row';
import {vw} from '../../constant';
import {reportPost} from '../../api/home';
import {getMessage, Toast} from '../../utils/helpers';

const filterItems = [
  {label: 'Product Name (A-Z)', value: 'name'},
  {label: 'Price (Low to High)', value: 'LH'},
  {label: 'Price (High to Low)', value: 'HL'},
];

const Shop: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const shopId = route?.params?.shopId;

  const [modalVisible, setModalVisible] = useState(false);
  const [ReportSuccess, setReportSuccess] = useState(false);
  const [shopDetails, setShopDetails] = useState([]);
  const [shopProduct, setShopProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [reportVisible, setReportVisible] = useState({
    visibility: false,
    id: null,
  });
  const [reportLoader, setReportLoader] = useState(false);

  const handleReportPress = () => {
    setModalVisible(false);
    setReportVisible({...reportVisible, visibility: true});
  };

  useEffect(() => {
    const filterOrders = () => {
      let filtered = [...shopProduct];
      if (filter == 'name') {
        filtered.sort((a: any, b: any) =>
          a?.shop_name?.localeCompare(b?.shop_name),
        );
      }
      if (filter == 'LH') {
        filtered.sort((a: any, b: any) => a?.price - b?.price);
      }
      if (filter == 'HL') {
        filtered.sort((a: any, b: any) => b?.price - a?.price);
      }
      setFilteredData(filtered);
    };

    filterOrders();
  }, [shopProduct, filter]);

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
    setLoading(false);
  };

  if (loading) {
    return <Loader />;
  }

  const handleReport = async () => {
    setReportLoader(true);
    const data = {
      reportable_type: `Shop`,
      reportable_id: shopId,
      reason: `${shopId} Store Report`,
    };

    let formData = new FormData();
    Object.entries(data).forEach(item => {
      formData.append(item[0], item[1]);
    });
    await reportPost(formData)
      // .unwrap()
      .then(res => {
        if (res?.data) {
          console.log('RESSSSSSSSSSSSSSSS', res?.data);
          setReportVisible({
            visibility: false,
            id: null,
          });
          setReportLoader(false);
          setReportSuccess(true);
          navigation.goBack();
          // handleDotPress(null);
        }
      })
      .catch(err => {
        setReportLoader(false);
        setReportVisible({
          visibility: false,
          id: null,
        });
        // handleDotPress(null);
        Toast.error(getMessage(err?.message));

        console.log('Errorr  errerrerrerrerrerrerrerrerrfrom ', err);
      });
  };

  const handleRemoveFromWishlist = async (
    productId: number,
    saved: boolean,
  ) => {
    let arr = [...shopProduct];
    let index = shopProduct.findIndex(item => item?.id == productId);
    arr[index].is_saved = !arr[index].is_saved;
    setShopProduct(arr);

    if (saved) {
      let saved_item;
      await getSavedItems()
        .then(res => {
          if (res?.data) {
            saved_item = res?.data?.data?.data?.filter(
              item =>
                item.savable_type == `App\\Models\\Product` &&
                item.savable_id == productId,
            );
          }
        })
        .catch(err => {
          console.log('ERRRRRRORRRRR SAVEDDDDDDDDDDDD', err);
        });

      const data = {
        item_id: saved_item[0].savable_id,
        item_type: 'product',
      };
      const form = new FormData();
      Object.entries(data).map(([key, value]) => {
        form.append(key, value);
      });

      // console.log('SAVEDDDDDDDDD IDDDDDDDDDDDDDD', saved_item);
      await removeSavedItem(form).catch(err => console.log('ERRORRRRR', err));
    } else {
      const data = {
        item_id: productId,
        item_type: 'product',
      };

      const form = new FormData();
      Object.entries(data).map(([key, value]) => {
        form.append(key, value);
      });

      await saveItem(form).catch(err => {
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

            <Row
              align="flex-start"
              justify="space-between"
              style={{width: '100%', paddingHorizontal: vw}}>
              <View style={{width: '50%'}}>
                <InterMedium lines={2} style={styles.mainheading}>
                  {shopDetails?.shop_name}
                </InterMedium>
              </View>
              {filteredData.length != 0 && (
                <View style={{width: '50%'}}>
                  <InterRegular style={styles.heading}>Sort by:</InterRegular>
                  <DropDownTextInput
                    items={filterItems}
                    defaultValue={filter}
                    placeholder="Select Sort"
                    onChangeValue={setFilter}
                    style={styles.dropDown}
                  />
                </View>
              )}
            </Row>

            <WishlistScreen
              wishlist={filteredData}
              heart={true}
              addCart={true}
              product={true}
              handleRemove={handleRemoveFromWishlist}
              onPress={id => {
                navigation.navigate('ProductView', {productId: id});
              }}
            />
          </Card>
          <GeneralModal
            visible={reportVisible.visibility}
            closeModal={() =>
              setReportVisible({
                visibility: false,
                id: null,
              })
            }
            icon={images.qmark}
            title="Report Post"
            message="Are you sure you want to report this post?"
            SecondaryText1="Yes"
            SecondaryText2="No"
            onPress={handleReport}
            secondaryBtn={true}
            loading={reportLoader}
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
