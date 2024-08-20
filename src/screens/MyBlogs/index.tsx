

import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useLayoutEffect } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../utils/theme';
import InterMedium from '../../components/Text/InterMedium';
import styles from './styles';
import { dummyContentSaved } from '../../dummyData';
import Card from '../../components/Card';
import ContentSavedScreen from '../../components/ContentSaved';
import CustomButton from '../../components/CustomButton';
import MediaCard from '../../components/MediaCard';


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
const MyBlogs: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const title = route?.params?.title || ""


    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },
            title: title,
            headerRight: () => (
                <TouchableOpacity style={styles.postButton} onPress={() => {
                    if (title == "My Blogs") {
                        navigation.navigate("AddBlog", { title: "Add Blog" })
                    } else if (title == "My Videos") {
                        navigation.navigate("AddBlog", { title: "Add Videos" })

                    } else {
                        navigation.navigate("AddBlog", { title: "Add Article" })
                    }
                }}>
                    <InterMedium style={styles.postTxt}>{title == "My Blogs" ? "Add Blog" : title == "My Videos" ? "Add Videos" : "Add Article"}</InterMedium>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                {title == "My Videos" ? (
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
                ) : (
                    <FlatList
                        data={dummyContentSaved}
                        renderItem={({ item }) => (
                            <Card style={styles.itemCard}>
                                <ContentSavedScreen
                                    item={item}
                                    ContentSaved={dummyContentSaved}
                                    title={title == "My Blogs" ? 'Blog Title' : "Article Title"}
                                    viewBtn='View Full Blog'
                                    onItemPress={() => navigation.navigate("ViewBlog", { item, title: title == "My Blogs" ? 'Blog Title' : "Article Title", edit: true })}
                                //  onAddToCart={handleAddToCart}
                                // onRemoveFromWishlist={handleRemoveFromWishlist}
                                />
                            </Card>
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.container}
                    />
                )}

            </View>


        </ScrollView>
    );
};

export default MyBlogs;

