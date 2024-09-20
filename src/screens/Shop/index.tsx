import React, { useLayoutEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import InterRegular from '../../components/Text/InterRegular';
import WishlistScreen from '../../components/WishList';
import ContentSavedScreen from '../../components/ContentSaved';
import { Picker } from '@react-native-picker/picker';
import InterMedium from '../../components/Text/InterMedium';
import ReportBlockModal from '../../components/ReportBlockModal';
import GeneralModal from '../../components/GeneralModal';

const dummyWishlist = [
    {
        id: '1',
        name: 'Product 1',
        price: 20,
        imageUrl: `${images.pro1}`,
    },
    {
        id: '2',
        name: 'Product 2',
        price: 30,
        imageUrl: `${images.pro2}`,

    },
    {
        id: '3',
        name: 'Product 3',
        price: 25,
        imageUrl: `${images.pro2}`,

    },
    {
        id: '4',
        name: 'Product 4',
        price: 25,
        imageUrl: `${images.pro1}`,

    },
    {
        id: '5',
        name: 'Product 5',
        price: 25,
        imageUrl: `${images.pro1}`,

    },
    {
        id: '6',
        name: 'Product 6',
        price: 25,
        imageUrl: `${images.pro2}`,

    },
];

const productFilter = [
    { name: 'a', id: 1 },
    { name: 'b', id: 2 },
];


const Shop: React.FC = () => {
    const navigation = useNavigation();
    const [commentsVisible, setCommentsVisible] = useState<boolean>(false)
    const [active, setActive] = useState<number>(1)
    const [modalVisible, setModalVisible] = useState(false);
    const [ReportSuccess, setReportSuccess] = useState(false);

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
                            <Image source={images.shop11} style={styles.imageStyle} />
                        </View>
                        <View style={styles.sortConatiner}>
                            <InterMedium style={styles.mainheading}>Shop Name</InterMedium>
                            <View >
                                <InterRegular style={styles.heading}>
                                    Sort by:
                                </InterRegular>
                                <View>

                                    <Picker
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

                                    </Picker>
                                </View>
                            </View>



                        </View>

                        <WishlistScreen
                            wishlist={dummyWishlist}
                            onAddToCart={handleAddToCart}
                            onRemoveFromWishlist={handleRemoveFromWishlist}
                            heart={true}
                            addCart={true}
                            product={true}
                            onPress={() => navigation.navigate("ProductView")}

                        />
                    </Card>

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



export default Shop;