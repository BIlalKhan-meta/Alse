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
import {fontSizes, vh, vw} from '../../constant';
import Card from '../../components/Card';
import PostComponent from '../../components/PostComponent';
import InterBold from '../../components/Text/InterBold';
import CommentsModal from '../../components/CommentsModal';
import styles from './styles';
import HeaderComponent from '../../components/HeaderComponent';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import InterRegular from '../../components/Text/InterRegular';
import WishlistScreen from '../../components/WishList';
import ContentSavedScreen from '../../components/ContentSaved';
import {Picker} from '@react-native-picker/picker';
import InterMedium from '../../components/Text/InterMedium';
import ReportBlockModal from '../../components/ReportBlockModal';
import GeneralModal from '../../components/GeneralModal';
import SortModal from '../../components/SortModal';
import {getProductByShop, shopDetail} from '../../api/shop';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import Row from '../../components/Row';

const filterItems = [
  {label: 'Product Name (A-Z)', value: 'name'},
  {label: 'Price (Low to High)', value: 'LH'},
  {label: 'Price (High to Low)', value: 'HL'},
];

const MyShop: React.FC = () => {
  const navigation = useNavigation();
  const isFoused = useIsFocused();
  const route = useRoute();
  const shopId = route?.params?.shopId;

  const [ReportSuccess, setReportSuccess] = useState(false);
  const [shopDetails, setShopDetails] = useState([]);
  const [shopProduct, setShopProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisibleSort, setModalVisibleSort] = useState(false);
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // const [modalVisible, setModalVisible] = useState(false);
  const [sortValue, setSortValue] = useState<string>(''); // State for the selected sort value

  const handleSelectSort = (value: string) => {
    setSortValue(value);
    // Implement sorting logic here based on the selected value
  };

  const handleAddToCart = (productId: string) => {
    // Implement your logic to add the product to cart
    console.log(`Product with id ${productId} added to cart`);
  };

  const handleRemoveFromWishlist = (productId: string) => {
    // Implement your logic to remove the product from wishlist
    console.log(`Product with id ${productId} removed from wishlist`);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.headerColor,
      },
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('EditShop', {shopId});
          }}>
          <Image source={images.edit} style={styles.threeDots} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    getData();
  }, [isFoused]);

  const getData = async () => {
    setLoading(true);
    const res = await shopDetail(shopId);
    const res2 = await getProductByShop(shopId);

    setShopDetails(res?.data?.data);
    setShopProduct(res2?.data?.data?.data);
    setLoading(false);
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

  if (loading) {
    return <Loader />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Card style={styles.contentContainer}>
          <Row
            align="flex-start"
            justify="space-between"
            style={{width: '100%', paddingHorizontal: vw}}>
            <View style={{width: '50%'}}>
              <InterMedium lines={2} style={styles.mainheading}>
                {shopDetails?.shop_name}
              </InterMedium>
            </View>
            <View style={{width: '50%', zIndex: 100}}>
              <InterRegular style={styles.heading}>Sort by:</InterRegular>
              <DropDownTextInput
                items={filterItems}
                defaultValue={filter}
                placeholder="Select Sort"
                onChangeValue={setFilter}
                style={styles.dropDown}
              />
            </View>
          </Row>

          <WishlistScreen
            wishlist={filteredData}
            onAddToCart={handleAddToCart}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            // heart={true}
            product={true}
            onPress={id => {
              // console.log('====================================');
              // console.log(id, "Id Frommm producttt");
              // console.log('====================================');
              // navigation.navigate("ProductView")
              navigation.navigate('ProductView', {productId: id});
            }}
          />
          <View style={styles.btnConatiner}>
            <CustomButton
              style={styles.secondaryBtn1}
              onPress={() => navigation.navigate('AddProduct', {shopId})}>
              Add Product
            </CustomButton>

            <CustomButton
              style={styles.secondaryBtn2}
              // containerStyle={styles.buttonContainerStyle}
              txtstyle={{color: colors.themeColor}}
              onPress={() => {
                navigation.navigate('MyOrders', {MyOrder: true});
              }}>
              Orders
            </CustomButton>
          </View>
        </Card>
        <SortModal
          visible={modalVisibleSort}
          onClose={() => setModalVisibleSort(false)}
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
    </ScrollView>
  );
};

export default MyShop;
