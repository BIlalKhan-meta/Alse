import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { images } from '../../utils/images';
import CardComponent from '../../components/CardComponent';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';
import Card from '../../components/Card';
import PostComponent from '../../components/PostComponent';
import InterBold from '../../components/Text/InterBold';
import CommentsModal from '../../components/CommentsModal';
import styles from './styles';
import HeaderComponent from '../../components/HeaderComponent';
import { useNavigation, useRoute } from '@react-navigation/native';
import InterRegular from '../../components/Text/InterRegular';
import WishlistScreen from '../../components/WishList';
import ContentSavedScreen from '../../components/ContentSaved';
import { Picker } from '@react-native-picker/picker';
import InterMedium from '../../components/Text/InterMedium';
import ReportBlockModal from '../../components/ReportBlockModal';
import GeneralModal from '../../components/GeneralModal';
import SortModal from '../../components/SortModal';
import { getProductByShop, shopDetail } from '../../api/shop';
import CustomButton from '../../components/CustomButton';

const dummyWishlist = [
    {
        id: '1',
        name: 'Product 1',
        price: 20,
        imageUrl: `${images.pro1}`,
        size: "L, M, S",
        colors: "Green"
    },
    {
        id: '2',
        name: 'Product 2',
        price: 30,
        imageUrl: `${images.pro2}`,
        size: "L, M,",
        colors: "Green"

    },
    {
        id: '3',
        name: 'Product 3',
        price: 25,
        imageUrl: `${images.pro2}`,
        size: "L, M, S",
        colors: "Green"


    },
    {
        id: '4',
        name: 'Product 4',
        price: 25,
        imageUrl: `${images.pro1}`,
        size: "L, M, S",
        colors: "Green"

    },
    {
        id: '5',
        name: 'Product 5',
        price: 25,
        imageUrl: `${images.pro1}`,
        size: "L, M, S",
        colors: "Green"


    },
    {
        id: '6',
        name: 'Product 6',
        price: 25,
        imageUrl: `${images.pro2}`,
        size: "L, M, S",
        colors: "Green"


    },
];

const productFilter = [
    { name: 'a', id: 1 },
    { name: 'b', id: 2 },
];


const MyShop: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const shopId = route?.params?.shopId;



    const [commentsVisible, setCommentsVisible] = useState<boolean>(false)
    const [active, setActive] = useState<number>(1)
    const [modalVisible, setModalVisible] = useState(false);
    const [ReportSuccess, setReportSuccess] = useState(false);
    const [shopDetails, setShopDetails] = useState([]);
    const [shopProduct, setShopProduct] = useState([]);

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
    const handleReportPress = () => {
        setModalVisible(false);
        setReportSuccess(true)
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    setModalVisible(!modalVisible)
                }}>
                    <Image
                        source={images.dots}
                        style={styles.threeDots}

                    />
                </TouchableOpacity>
            ),
        });
    }, [navigation, modalVisible]);

    const options = [
        // { text: 'Get Link', onPress: () => { handleGetLink(); } },
        { text: 'Report Shop', onPress: () => { handleReportPress(); } },
        // { text: 'Block', onPress: () => { handleBlockPress(); } },
    ];


    useEffect(() => {
        getData()
    }, [])

    const getData = async () => {
        const res = await shopDetail(shopId)
        const res2 = await getProductByShop(shopId)

        setShopDetails(res?.data?.data)
        setShopProduct(res2?.data?.data)
        console.log('====================================');
        console.log(res?.data?.data, "====ressss");
        console.log(res2?.data?.data, "====rssss producttttt");
        console.log('====================================');
    }


    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>

                <View style={styles.container}>


                    <ReportBlockModal
                        isVisible={modalVisible}
                        options={options}
                    />


                    <Card style={styles.contentContainer}>

                        <View style={styles.banner}>
                            <Image
                                // source={images.shop11} 
                                source={{ uri: shopDetails?.banner }}
                                style={styles.imageStyle} />
                        </View>

                        <View style={styles.sortConatiner}>
                            <InterMedium style={styles.mainheading}>Shop Name</InterMedium>
                            <View >
                                <InterRegular style={styles.heading}>
                                    Sort by:
                                </InterRegular>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(true)}
                                        style={styles.sortInput}
                                    >
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
                            onAddToCart={handleAddToCart}
                            onRemoveFromWishlist={handleRemoveFromWishlist}
                            heart={true}
                            addCart={true}
                            product={true}
                            onPress={() => navigation.navigate("ProductView")}

                        />
                        <View style={styles.btnConatiner}>
                            <CustomButton style={styles.secondaryBtn1}
                                onPress={() => navigation.navigate("AddProduct", { shopId })}
                            >
                                Add Product
                            </CustomButton>

                            <CustomButton
                                style={styles.secondaryBtn2}
                                containerStyle={styles.buttonContainerStyle}
                                txtstyle={{ color: colors.themeColor }}
                            // onPress={closeModal}
                            >
                                Orders
                            </CustomButton>
                        </View>



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
                        title='Report Shop'
                        message='Shop has been reported'
                        buttonText='Ok'
                        onPress={() => {
                            setReportSuccess(false)
                        }}
                        primaryBtn={true}
                    />


                </View>
            </TouchableWithoutFeedback>
        </ScrollView>
    );
};



export default MyShop;