import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, TouchableWithoutFeedback, Platform } from 'react-native';
import { images } from '../../utils/images';
import { colors } from '../../utils/theme';
import Card from '../../components/Card';

import { useNavigation, useRoute } from '@react-navigation/native';


import GeneralModal from '../../components/GeneralModal';
import styles from './styles';
import MyStoreTopTabsNavigation from '../../navigation/MyStoreTabs';
import { vh } from '../../constant';
import InterRegular from '../../components/Text/InterRegular';
import InterBoldAverage from '../../components/Text/InterBoldAverage';
import InterMedium from '../../components/Text/InterMedium';
import Swiper from 'react-native-swiper';
import RatingandReviewComponent from '../../components/RatingandReviewComponent';
import ShopComponent from '../../components/ShopComponent';
import StoreOrderComponent from '../../components/StoreOrder';
import { addProductToCart, productDetail, productRating } from '../../api/product';
import Loader from '../../components/Loader';
import { getMessage, Toast } from '../../utils/helpers';



const productFilter = [
    { name: 'a', id: 1 },
    { name: 'b', id: 2 },
];

const bannerImages = [
    images.shop11,
    images.shop1,
    images.shop3, // Add more images if needed
];


const ProductView: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute()
    const { productId } = route.params;
    console.log('====================================');
    console.log(productId, "ProducttttIddd");
    console.log('====================================');
    // const { type } = route?.params;

    const [commentsVisible, setCommentsVisible] = useState<boolean>(false)
    const [activeTab, setActiveTab] = useState<number>(1)
    const [modalVisible, setModalVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [reportInput, setReportInput] = useState(false);
    const [ReportSuccess, setReportSuccess] = useState(false);
    const [productDetails, setProductDetails] = useState([]);
    const [productReviews, setProductReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const handleReportPress = () => {
        setModalVisible(false);
        setReportVisible(true)
    };


    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },

        });
    }, [navigation]);

    useEffect(() => {
        getData()
    }, [])

    const getData = async () => {
        setLoading(true)
        const res = await productDetail(productId)
        const res2 = await productRating(productId)
        setProductDetails(res?.data?.data || {});
        setProductReviews(res2?.data?.data?.data)
        setLoading(false)
        console.log('====================================');
        // console.log(res?.data?.data, "====rssss producttttt");
        console.log(res2?.data?.data?.data, "====rssss Reviewsss");
        console.log('====================================');
    }





    if (loading) {
        return (<Loader />)
    }


    const renderContent = () => {
        switch (activeTab) {
            case 1:
                return (
                    <StoreOrderComponent productItem={productDetails} />
                );
            case 2:
                return (
                    <RatingandReviewComponent reviews={productReviews} />
                );
            case 3:
                return (
                    <ShopComponent />
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <TouchableWithoutFeedback
                onPress={() => setModalVisible(false)}
            >


                <View style={[styles.container]}>

                    {productDetails && productDetails.images && (
                        <Card style={styles.cardContainer}>


                            <View style={styles.banner}>
                                {/* <Image source={images.shop11} style={styles.imageStyle} /> */}
                                {productDetails?.images[0]?.path && (

                                    <Swiper
                                        // autoplay={true}
                                        showsPagination={false}
                                        // loop={true}
                                        // dotStyle={styles.dotStyle}
                                        // activeDotStyle={styles.activeDotStyle}
                                        // autoplayTimeout={3}
                                        showsButtons={true}
                                        nextButton={<Text style={styles.buttonText}>›</Text>}
                                        prevButton={<Text style={styles.buttonText}>‹</Text>}
                                    >
                                        {productDetails?.images?.map((image, index) => {

                                            console.log('====================================');
                                            console.log(image?.path, "Frommmm mappppp");
                                            console.log('====================================');
                                            return (

                                                <View key={index}>
                                                    <Image source={{ uri: image?.path }} style={styles.imageStyle} />
                                                </View>
                                            )
                                        }
                                        )}
                                    </Swiper>
                                )}

                            </View>


                            <View style={styles.productDetails}>

                                <InterMedium style={styles.productName}>{productDetails?.title}</InterMedium>
                                <View style={styles.priceContainer}>
                                    <InterRegular style={styles.ratingTxt}>4.5 (100+)</InterRegular>
                                    <InterBoldAverage style={styles.productPrice}>{productDetails?.price}</InterBoldAverage>
                                </View>

                            </View>

                            <View style={styles.vendorContainer}>
                                <InterRegular style={styles.vendorTxt}>{productDetails?.shop?.shop_name}</InterRegular>

                                <View style={styles.bulletTextContainer}>
                                    <View style={styles.bullet} />
                                    <InterRegular style={styles.vendorTxt}>{productDetails?.category?.title}</InterRegular>
                                </View>

                                {/* <View style={styles.bulletTextContainer}>
        <View style={styles.bullet} />
        <InterRegular style={styles.vendorTxt}>SKU:564</InterRegular>
    </View> */}

                            </View>




                            <View style={styles.tabBar}>
                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 1 && styles.activeTab]}
                                    onPress={() => setActiveTab(1)}
                                >
                                    <Text style={activeTab === 1 ? styles.activeText : styles.inactiveText}>Description</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 2 && styles.activeTab]}
                                    onPress={() => setActiveTab(2)}
                                >
                                    <Text style={activeTab === 2 ? styles.activeText : styles.inactiveText}>Rating</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tab, activeTab === 3 && styles.activeTab]}
                                    onPress={() => setActiveTab(3)}
                                >
                                    <Text style={activeTab === 3 ? styles.activeText : styles.inactiveText}>Similar Products</Text>
                                </TouchableOpacity>
                            </View>

                            {renderContent()}
                        </Card>
                    )}


                    <GeneralModal
                        visible={reportVisible}
                        closeModal={() => setReportVisible(false)}
                        icon={images.qmark}
                        title='Report Store'
                        message='Are you sure you want to report this Store?'
                        buttonText='Yes'
                        buttonText2='No'
                        onPress={() => {
                            setReportVisible(false)
                            setReportInput(true)

                        }}
                        smallButtons={true}
                    />

                    <GeneralModal
                        visible={reportInput}
                        closeModal={() => setReportInput(false)}
                        // icon={images.doubleCheck}
                        title='Reason Of Report Store'
                        // message='Post has been delete successfully.'
                        buttonText='Ok'
                        inputVisible={true}
                        onPress={() => {
                            setReportInput(false)
                            setReportSuccess(true)
                        }}
                    />

                    <GeneralModal
                        visible={ReportSuccess}
                        closeModal={() => setReportSuccess(false)}
                        icon={images.doubleCheck}
                        title='Report Store'
                        message='Store has been report successfully.'
                        buttonText='Ok'
                        onPress={() => {
                            setReportSuccess(false)
                        }}
                    />





                </View>

            </TouchableWithoutFeedback>

        </ScrollView>
    );
};



export default ProductView;