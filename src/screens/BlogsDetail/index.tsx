import { Text, View, Image, TouchableOpacity } from 'react-native';
import styles from './styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLayoutEffect } from 'react';
import { colors } from '../../utils/theme';
import Card from '../../components/Card';
import { images } from '../../utils/images';
import CustomButton from '../../components/CustomButton';
import InterRegular from '../../components/Text/InterRegular';
import InterMedium from '../../components/Text/InterMedium';

const ViewBlog: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { item, title, edit } = route?.params;
    // const title = route?.params?.title || ""
    console.log(title, edit, "Titllleeeeeeeee")
    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor,
            },
            headerTitle: `${title}`,
            headerTitleStyle: {
                color: colors.black,
            },
            headerRight: () => (
                <>
                    <TouchableOpacity style={styles.postButton} onPress={() => {
                        if (title == "My Blogs") {
                            navigation.navigate("AddBlog", { title: "Update Blog" })
                        } else if (title == "Blog Title") {
                            navigation.navigate("AddBlog", { title: "Update Blog" })
                        } else if (title == "Video") {
                            navigation.navigate("AddBlog", { title: "Update Video" })
                        } else {
                            navigation.navigate("AddBlog", { title: "Update Article" })

                        }
                    }}>
                        <Image source={images.edit} />
                    </TouchableOpacity>
                </>
            )
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Card style={styles.contentContainer}>

                <View>
                    <Image
                        source={item.imageUrl ? item.imageUrl : images.blog1} // Replace with the correct image URL or require local image
                        style={styles.blogImage}
                        resizeMode="cover"
                    />
                    {edit &&
                        <View style={[styles.statusContainer, !item.active && styles.activeContainer]}>
                            <InterRegular style={styles.activeTitle}>{item.active ? "Active" : "Inactive"}</InterRegular>
                        </View>
                    }
                </View>


                <Text style={styles.blogTitle}>{title == "View Blog Title" ? "Blog Title" : title == "View Article Title" ? "Artcile Title" : title}</Text>
                <Text style={styles.blogContent}>
                    {item.name ? item.name : item.description}
                </Text>

                {title == "Video" &&
                    <InterRegular style={styles.category}>{item.category}</InterRegular>

                }

                {edit && (

                    <View style={styles.btnContainer}>
                        <CustomButton style={styles.checkoutButton}
                            onPress={() => {
                                if (title == "My Blogs") {
                                    navigation.navigate("AddBlog", { title: "Update Blog" })
                                } else if (title == "Blog Title") {
                                    navigation.navigate("AddBlog", { title: "Update Blog" })
                                } else if (title == "Video") {
                                    navigation.navigate("AddBlog", { title: "Update Video" })
                                }
                                else {
                                    navigation.navigate("AddBlog", { title: "Update Article" })

                                }
                            }}
                        >
                            Edit {title == "My Blogs" ? "Blog" : title == "Video" ? "Video" : "Article"}
                        </CustomButton>

                        <CustomButton style={styles.shoppingButton} txtstyle={styles.shoppingTxt}>
                            Inactive {title == "My Blogs" ? "Blog" : title == "Video" ? "Video" : "Article"}
                        </CustomButton>
                    </View>
                )}

            </Card>
        </View>
    );
};

export default ViewBlog;
