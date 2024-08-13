

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
                    } else {
                        navigation.navigate("AddBlog", { title: "Add Article" })

                    }
                }}>
                    <InterMedium style={styles.postTxt}>{title == "My Blogs" ? "Add Blog" : "Add Article"}</InterMedium>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
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
            </View>


        </ScrollView>
    );
};

export default MyBlogs;

