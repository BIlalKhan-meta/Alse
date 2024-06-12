// Home.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
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

const posts = [
    {
        avatar: `${images.user}`,
        name: 'John Doe',
        country: 'Newyork, USA',
        time: '12:30 AM',
        postText: 'Haters will say what they want, but their hate will never stop you from casting your dreams just believe in yourself ...Read More',
        postImage: `${images.postImage1}`,
        likes: 120,
        comments: 45,
        share: 25,
        account: "public"
    },
    {
        avatar: `${images.user2}`,
        name: 'Jane Smith',
        country: 'UK',
        time: '5h ago',
        postText: 'Haters will say what they want, but their hate will never stop you from casting your dreams just believe in yourself ...Read More',
        postImage: `${images.postImage2}`,
        likes: 80,
        comments: 20,
        share: 10,
        account: "private"

    },
    // Add more posts as needed
];


const dummyComments = [
    {
        id: 1,
        userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        userName: 'John Doe',
        userImage: 'https://via.placeholder.com/150',
        comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
        id: 2,
        userAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        userName: 'Jane Smith',
        userImage: 'https://via.placeholder.com/150',
        comment: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        id: 3,
        userAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        userName: 'Mike Johnson',
        userImage: 'https://via.placeholder.com/150',
        comment: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },

];

const dummyWishlist = [
    {
        id: '1',
        name: 'Product 1',
        price: 20,
        imageUrl: 'https://via.placeholder.com/150',
    },
    {
        id: '2',
        name: 'Product 2',
        price: 30,
        imageUrl: 'https://via.placeholder.com/150',
    },
    {
        id: '3',
        name: 'Product 3',
        price: 25,
        imageUrl: 'https://via.placeholder.com/150',
    },
    {
        id: '4',
        name: 'Product 4',
        price: 25,
        imageUrl: 'https://via.placeholder.com/150',
    },
];

const Saved: React.FC = () => {
    const navigation = useNavigation();
    const [commentsVisible, setCommentsVisible] = useState<boolean>(false)
    const [active, setActive] = useState<number>(1)

    const handleAddToCart = (productId: string) => {
        // Implement your logic to add the product to cart
        console.log(`Product with id ${productId} added to cart`);
    };

    const handleRemoveFromWishlist = (productId: string) => {
        // Implement your logic to remove the product from wishlist
        console.log(`Product with id ${productId} removed from wishlist`);
    };

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                {/* Header */}
                <HeaderComponent
                    label={'Saved'}
                    onBackPress={() => navigation.goBack()}
                    chatVisible={true}
                />

                <Card style={styles.activeContainer}>
                    <TouchableOpacity style={active == 1 ? styles.activeBtn : styles.InactiveBtn}
                        onPress={() => setActive(1)}
                    >
                        <InterRegular style={active == 1 ? styles.activeTxt : styles.InactiveTxt}>
                            Post Saved
                        </InterRegular>
                    </TouchableOpacity>

                    <TouchableOpacity style={active == 2 ? styles.activeBtn : styles.InactiveBtn}
                        onPress={() => setActive(2)}

                    >
                        <InterRegular style={active == 2 ? styles.activeTxt : styles.InactiveTxt}>
                            Wishlist
                        </InterRegular>
                    </TouchableOpacity>

                    <TouchableOpacity style={active == 3 ? styles.activeBtn : styles.InactiveBtn}
                        onPress={() => setActive(3)}
                    >
                        <InterRegular style={active == 3 ? styles.activeTxt : styles.InactiveTxt}>
                            Content Saved
                        </InterRegular>
                    </TouchableOpacity>
                </Card>
                {active == 1 && (
                    <View>
                        {posts.map((post, index) => (
                            <PostComponent
                                key={index}
                                avatar={post.avatar}
                                name={post.name}
                                country={post.country}
                                time={post.time}
                                postText={post.postText}
                                postImage={post.postImage}
                                likes={post.likes}
                                comments={post.comments}
                                share={post.share}
                                account={post.account}
                                onCommnetPress={() => setCommentsVisible(true)}
                            />
                        ))}

                        <CommentsModal
                            visible={commentsVisible}
                            closeModal={() => setCommentsVisible(false)}
                            // icon={CheckedIcon}
                            title='Successfully'
                            message='Password has been updated successfully'
                            buttonText='Apply'
                            onPress={() => navigation.navigate("Home")}
                            comments={dummyComments}
                        />
                    </View>
                )}

                {active == 2 && (
                    <Card>
                        <View>
                            <InterRegular>
                                Sort by:
                            </InterRegular>
                        </View>

                        <WishlistScreen
                            wishlist={dummyWishlist}
                            onAddToCart={handleAddToCart}
                            onRemoveFromWishlist={handleRemoveFromWishlist}
                        />
                    </Card>
                )}

            </View>
        </ScrollView>
    );
};



export default Saved;
