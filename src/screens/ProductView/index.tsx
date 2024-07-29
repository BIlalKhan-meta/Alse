import React, { useLayoutEffect, useState } from 'react';
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



const productFilter = [
    { name: 'a', id: 1 },
    { name: 'b', id: 2 },
];


const ProductView: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute()
    // const { type } = route?.params;

    const [commentsVisible, setCommentsVisible] = useState<boolean>(false)
    const [active, setActive] = useState<number>(1)
    const [modalVisible, setModalVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [reportInput, setReportInput] = useState(false);
    const [ReportSuccess, setReportSuccess] = useState(false);

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

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback
                onPress={() => setModalVisible(false)}
            >


                <View style={[styles.container, Platform.OS == "ios" && { height: vh * 100 }]}>


                    <Card style={styles.cardContainer}>


                        <View style={styles.banner}>
                            <Image source={images.shop11} style={styles.imageStyle} />

                        </View>


                        <View style={styles.productDetails}>

                            <InterMedium style={styles.productName}>{"Product Name"}</InterMedium>
                            <View style={styles.priceContainer}>
                                <InterRegular style={styles.ratingTxt}>4.5 (100+)</InterRegular>
                                <InterBoldAverage style={styles.productPrice}>$45</InterBoldAverage>
                            </View>

                        </View>

                        <View style={styles.vendorContainer}>
                            <InterRegular style={styles.vendorTxt}>Vendor Abc</InterRegular>

                            <View style={styles.bulletTextContainer}>
                                <View style={styles.bullet} />
                                <InterRegular style={styles.vendorTxt}>Brand A</InterRegular>
                            </View>

                            <View style={styles.bulletTextContainer}>
                                <View style={styles.bullet} />
                                <InterRegular style={styles.vendorTxt}>SKU:564</InterRegular>
                            </View>

                        </View>


                        <View style={styles.contentContainer}>
                            <MyStoreTopTabsNavigation />
                        </View>

                    </Card>

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