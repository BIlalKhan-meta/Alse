// Home.tsx
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { images } from '../../utils/images';
import CardComponent from '../../components/CardComponent';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';
import Card from '../../components/Card';
import PostComponent from '../../components/PostComponent';
import InterBold from '../../components/Text/InterBold';
import CommentsModal from '../../components/CommentsModal';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import HeaderComponent from '../../components/HeaderComponent';
import ReactModal from '../../components/ReactModal';
import { dummyComments, reactions } from '../../dummyData';
import styles from './styles';
import GeneralModal from '../../components/GeneralModal';
import { selectUserProfile } from '../../store/slices/authSlice';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../hooks/storeHooks';
import { getMyPost } from '../../store/slices/homeSlice';
import InterRegular from '../../components/Text/InterRegular';
import dayjs from 'dayjs';
import Loader from '../../components/Loader';

const posts = [
    {
        id: 1,
        avatar: `${images.user}`,
        name: 'John Doe',
        country: 'Newyork, USA',
        time: '12:30 AM',
        postText: 'Haters will say what they want, but their hate will never stop you from casting your dreams just believe in yourself ...Read More',
        postImage: `${images.postImage1}`,
        likes: 120,
        comments: 45,
        share: 25,
        account: "self"
    },
    {
        id: 2,
        avatar: `${images.user}`,
        name: 'Jane Smith',
        country: 'UK',
        time: '5h ago',
        postText: 'Haters will say what they want, but their hate will never stop you from casting your dreams just believe in yourself ...Read More',
        postImage: `${images.postImage2}`,
        likes: 80,
        comments: 20,
        share: 10,
        account: "self"

    },
    // Add more posts as needed
];




const MyPosts: React.FC = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const dispatch = useAppDispatch();
    const user = useSelector(selectUserProfile)

    const [commentsVisible, setCommentsVisible] = useState<boolean>(false)
    const [reactVisible, setrRactVisible] = useState(false);
    const [activePostId, setActivePostId] = useState<number | null>(null);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [loader, setLoader] = useState(false);
    const [data, setData] = useState([]);

    console.log('====================================');
    console.log("Here userss=sss>", user?.id);
    console.log('====================================');

    const handleDotPress = (postId: number) => {
        setActivePostId(activePostId === postId ? null : postId);
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: colors.headerColor
            },
            headerRight: () => (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate("Notifications")
                    }}>
                        <Image
                            source={images.bellIcon}
                            style={styles.threeDots}

                        />
                    </TouchableOpacity>
                    {/* 
                    <TouchableOpacity onPress={() => {
                        // setModalVisible(true)
                    }}>
                        <Image
                            source={images.searchIcon}
                            style={styles.threeDots}

                        />
                    </TouchableOpacity> */}
                </View>
            ),
        });
    }, [navigation]);


    const getData = () => {
        setLoader(true);
        let id = user?.id;
        dispatch(getMyPost(id))
            .unwrap()
            .then(res => {
                console.log(res?.data?.data?.data, "Ressss frommm Screeennnn???")
                setData(res?.data?.data?.data);
                setLoader(false);
            })
            .catch(err => {
                setLoader(false);
            });
    };

    useEffect(() => {
        getData();
    }, [isFocused, navigation]);

    if (loader) {
        return <Loader />;
    }



    const renderPost = ({ item }) => (
        <PostComponent
            id={item?.id}
            postID={item?.media[0]?.post_id}
            avatar={item?.avatar}
            name={item.name}
            country={item.country ? item.country : ""}
            time={dayjs(item?.media[0]?.date).format('hh:MM A')}
            postText={item?.description}
            postImage={item?.media[0]?.path}
            likes={item.likes}
            comments={item.comments}
            share={item.share}
            account={item.privacy}
            onCommnetPress={() => setCommentsVisible(true)}
            onSavePress={() => navigation.navigate("Saved")}
            onLikePress={() => setrRactVisible(true)}
            onDotPress={() => handleDotPress(item.id)}
            modalVisible={activePostId === item.id}
            handleBlockPress={() => {
                // handleDotPress();
                setDeleteVisible(true);
            }}
            handleReportPress={() => {
                // handleDotPress();
                navigation.navigate("CreatePost", { title: "Edit Post" });
            }}
        />
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <InterRegular style={styles.emptyText}>No Posts to Show.</InterRegular>
        </View>
    );

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>

                {/* <CardComponent
                    onTextInput={() => navigation.navigate("CreatePost")}
                    onVideoPress={() => navigation.navigate("CreatePost")}
                    onImagePress={() => navigation.navigate("CreatePost")}
                    onCameraPress={() => navigation.navigate("CreatePost")}
                />

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
                        onSavePress={() => navigation.navigate("Saved")}
                        onLikePress={() => setrRactVisible(true)}
                        onDotPress={() => handleDotPress(post.id)}
                        modalVisible={activePostId === post.id}
                        handleBlockPress={() => {
                            handleDotPress();
                            setDeleteVisible(true)
                        }}
                        handleReportPress={() => {
                            handleDotPress();
                            // setReportVisible(true)
                            // navigation.navigate("MyProfileUpdate")
                            navigation.navigate("CreatePost", { title: "Edit Post" })

                        }}

                    />
                ))} */}

                <FlatList
                    data={data}
                    renderItem={renderPost}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                    ListHeaderComponent={() => (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('CreatePost')}>
                            <View pointerEvents="none">
                                <CardComponent
                                    onTextInput={() => navigation.navigate('CreatePost')}
                                    onVideoPress={() => navigation.navigate('CreatePost')}
                                    onImagePress={() => navigation.navigate('CreatePost')}
                                />
                            </View>
                        </TouchableOpacity>
                    )}

                />

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

                <ReactModal
                    visible={reactVisible}
                    closeModal={() => setrRactVisible(false)}
                    reactions={reactions}
                />

                <GeneralModal
                    visible={deleteVisible}
                    closeModal={() => setDeleteVisible(false)}
                    icon={images.qmark}
                    title='Delete Post'
                    message='Are you sure you want to delete this Post?'
                    SecondaryText1='Yes'
                    SecondaryText2='No'
                    onPress={() => {
                        setDeleteVisible(false)
                        setDeleteSuccess(true)

                    }}
                    secondaryBtn={true}
                />

                <GeneralModal
                    visible={deleteSuccess}
                    closeModal={() => setDeleteSuccess(false)}
                    icon={images.checkedIcon}
                    title='Delete Post'
                    message='Post has been delete successfully.'
                    buttonText='Ok'
                    onPress={() => {
                        setDeleteSuccess(false)
                    }}
                    primaryBtn={true}
                />

            </View>
        </ScrollView>
    );
};



export default MyPosts;
