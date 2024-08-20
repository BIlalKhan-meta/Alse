// Home.tsx
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native';
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
import ReactModal from '../../components/ReactModal';
import { dummyContentSaved, reactions } from '../../dummyData';
import CustomButton from '../../components/CustomButton';
import MediaCard from '../../components/MediaCard';






const productFilter = [
    { name: 'a', id: 1 },
    { name: 'b', id: 2 },
];
const mediaData = [
    {
        id: 1,
        type: 'video',
        source: 'https://example.com/video.mp4',
        title: 'Topic Name',
        description: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
        category: 'Category A',
    },
    {
        id: 2,
        type: 'video',
        source: 'https://example.com/video.mp4',
        title: 'Topic Name',
        description: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
        category: 'Category A',
    },
    // Add more items as needed
];
const Blogs: React.FC = () => {
    const navigation = useNavigation();
    const [commentsVisible, setCommentsVisible] = useState<boolean>(false)
    const [reactVisible, setrRactVisible] = useState(false);
    const [active, setActive] = useState<number>(1)

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
                backgroundColor: colors.headerColor
            },
            title: active == 1 ? "Articles" : active == 2 ? "Blogs" : "Videos/Tutorials"
        });
    }, [navigation, active]);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                {/* Header */}
                {/* <HeaderComponent
                    label={'Saved'}
                    onBackPress={() => navigation.goBack()}
                    chatVisible={true}
                    searchVisible={true}
                    onChatPress={() => navigation.navigate("ChatScreen")}

                /> */}

                <View style={styles.activeContainer}>
                    <TouchableOpacity style={active == 1 ? styles.activeBtn : styles.InactiveBtn}
                        onPress={() => setActive(1)}
                    >
                        <InterRegular style={active == 1 ? styles.activeTxt : styles.InactiveTxt}>
                            Articles
                        </InterRegular>
                    </TouchableOpacity>

                    <TouchableOpacity style={active == 2 ? styles.activeBtn : styles.InactiveBtn}
                        onPress={() => setActive(2)}

                    >
                        <InterRegular style={active == 2 ? styles.activeTxt : styles.InactiveTxt}>
                            Blogs
                        </InterRegular>
                    </TouchableOpacity>

                    <TouchableOpacity style={active == 3 ? styles.activeBtn : styles.InactiveBtn}
                        onPress={() => setActive(3)}
                    >
                        <InterRegular style={active == 3 ? styles.activeTxt : styles.InactiveTxt}>
                            Videos
                        </InterRegular>
                    </TouchableOpacity>
                </View>
                {active == 1 && (
                    <>

                        <FlatList
                            data={dummyContentSaved}
                            renderItem={({ item }) => (
                                <Card style={styles.itemCard}>
                                    <ContentSavedScreen
                                        item={item}
                                        title='Article Title'
                                        viewBtn='View Full Article'
                                        onItemPress={() => navigation.navigate("ViewBlog", { item, title: "View Article Title" })}

                                    //  onAddToCart={handleAddToCart}
                                    // onRemoveFromWishlist={handleRemoveFromWishlist}
                                    />
                                </Card>
                            )}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.container}
                        />

                        <CustomButton style={styles.btn}
                            onPress={() => navigation.navigate("MyBlogs", { title: "My Articles" })}
                        >
                            My Articles
                        </CustomButton>
                    </>

                )}

                {active == 2 && (
                    <>
                        <FlatList
                            data={dummyContentSaved}
                            renderItem={({ item }) => (
                                <Card style={styles.itemCard}>
                                    <ContentSavedScreen
                                        item={item}
                                        ContentSaved={dummyContentSaved}
                                        title='Blog Title'
                                        viewBtn='View Full Blog'
                                        onItemPress={() => navigation.navigate("ViewBlog", { item, title: "View Blog Title" })}
                                    //  onAddToCart={handleAddToCart}
                                    // onRemoveFromWishlist={handleRemoveFromWishlist}
                                    />
                                </Card>
                            )}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.container}
                        />

                        <CustomButton style={styles.btn}
                            onPress={() => navigation.navigate("MyBlogs", { title: "My Blogs" })}
                        >
                            My Blogs
                        </CustomButton>
                    </>
                )}

                {active == 3 && (
                    <>
                        <FlatList
                            data={mediaData}
                            renderItem={({ item }) => (
                                <Card style={styles.itemCard}>
                                    <MediaCard
                                        type={item.type}
                                        source={item.source}
                                        title={item.title}
                                        description={item.description}
                                        category={item.category}
                                        onBookmarkPress={() => { }}
                                        onItemPress={() => navigation.navigate("ViewBlog", { item, title: "Video", edit: true })}

                                    />
                                </Card>
                            )}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.container}
                        />

                        <CustomButton style={styles.btn}
                            onPress={() => navigation.navigate("MyBlogs", { title: "My Videos" })}
                        >
                            My Videos
                        </CustomButton>
                    </>
                )}

            </View>
        </ScrollView>
    );
};



export default Blogs;
