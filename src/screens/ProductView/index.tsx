import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity, ScrollView} from 'react-native';
import {images} from '../../utils/images';
import Card from '../../components/Card';

import {useRoute} from '@react-navigation/native';

import GeneralModal from '../../components/GeneralModal';
import styles from './styles';
import InterRegular from '../../components/Text/InterRegular';
import InterBoldAverage from '../../components/Text/InterBoldAverage';
import InterMedium from '../../components/Text/InterMedium';
import Swiper from 'react-native-swiper';
import RatingandReviewComponent from '../../components/RatingandReviewComponent';
import ShopComponent from '../../components/ShopComponent';
import StoreOrderComponent from '../../components/StoreOrder';
import {productDetail} from '../../api/product';
import Loader from '../../components/Loader';

const ProductView: React.FC = () => {
  const route = useRoute();
  const {productId} = route?.params;

  const [activeTab, setActiveTab] = useState<number>(1);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportInput, setReportInput] = useState(false);
  const [ReportSuccess, setReportSuccess] = useState(false);
  const [productDetails, setProductDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      getData();
    }
  }, [productId]);

  const getData = async () => {
    setLoading(true);
    await productDetail(productId).then(async res => {
      if (res?.data) {
        setProductDetails(res?.data?.data || {});
        setLoading(false);
      }
    });
  };

  if (loading) {
    return <Loader />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 1:
        return <StoreOrderComponent productItem={productDetails} />;
      case 2:
        return <RatingandReviewComponent id={productId} />;
      case 3:
        return <ShopComponent id={productId} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.container]}>
        {productDetails && productDetails.images && (
          <Card style={styles.cardContainer}>
            <View style={styles.banner}>
              {productDetails?.images[0]?.path && (
                <Swiper
                  showsPagination={false}
                  nextButton={<Text style={styles.buttonText}>›</Text>}
                  prevButton={<Text style={styles.buttonText}>‹</Text>}>
                  {productDetails?.images?.map((image, index) => {
                    return (
                      <View key={index}>
                        <Image
                          source={{uri: image?.path}}
                          style={styles.imageStyle}
                        />
                      </View>
                    );
                  })}
                </Swiper>
              )}
            </View>

            <View style={styles.productDetails}>
              <InterMedium style={styles.productName}>
                {productDetails?.title}
              </InterMedium>
              <View style={styles.priceContainer}>
                {productDetails?.average_rating && (
                  <InterRegular style={styles.ratingTxt}>
                    {productDetails?.average_rating} (
                    {productDetails?.total_reviews > 100
                      ? '100+'
                      : productDetails?.total_reviews}
                    )
                  </InterRegular>
                )}
                <InterBoldAverage style={styles.productPrice}>
                  ${productDetails?.price}
                </InterBoldAverage>
              </View>
            </View>

            <View style={styles.vendorContainer}>
              <InterRegular style={styles.vendorTxt}>
                {productDetails?.shop?.shop_name}
              </InterRegular>

              <View style={styles.bulletTextContainer}>
                <View style={styles.bullet} />
                <InterRegular style={styles.vendorTxt}>
                  {productDetails?.category?.title}
                </InterRegular>
              </View>
            </View>

            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 1 && styles.activeTab]}
                onPress={() => setActiveTab(1)}>
                <Text
                  style={
                    activeTab === 1 ? styles.activeText : styles.inactiveText
                  }>
                  Description
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 2 && styles.activeTab]}
                onPress={() => setActiveTab(2)}>
                <Text
                  style={
                    activeTab === 2 ? styles.activeText : styles.inactiveText
                  }>
                  Rating
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 3 && styles.activeTab]}
                onPress={() => setActiveTab(3)}>
                <Text
                  style={
                    activeTab === 3 ? styles.activeText : styles.inactiveText
                  }>
                  Similar Products
                </Text>
              </TouchableOpacity>
            </View>

            {renderContent()}
          </Card>
        )}

        <GeneralModal
          visible={reportVisible}
          closeModal={() => setReportVisible(false)}
          icon={images.qmark}
          title="Report Store"
          message="Are you sure you want to report this Store?"
          buttonText="Yes"
          buttonText2="No"
          onPress={() => {
            setReportVisible(false);
            setReportInput(true);
          }}
          smallButtons={true}
        />

        <GeneralModal
          visible={reportInput}
          closeModal={() => setReportInput(false)}
          // icon={images.doubleCheck}
          title="Reason Of Report Store"
          // message='Post has been delete successfully.'
          buttonText="Ok"
          inputVisible={true}
          onPress={() => {
            setReportInput(false);
            setReportSuccess(true);
          }}
        />

        <GeneralModal
          visible={ReportSuccess}
          closeModal={() => setReportSuccess(false)}
          icon={images.doubleCheck}
          title="Report Store"
          message="Store has been report successfully."
          buttonText="Ok"
          onPress={() => {
            setReportSuccess(false);
          }}
        />
      </View>
    </ScrollView>
  );
};

export default ProductView;
