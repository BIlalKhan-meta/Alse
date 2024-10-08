import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import Card from '../../components/Card';
import styles from './styles';
import HeaderComponent from '../../components/HeaderComponent';
import InterRegular from '../../components/Text/InterRegular';
import { images } from '../../utils/images';
import HorizontalSeparator from '../../components/HorizontalSeparator';
import GeneralModal from '../../components/GeneralModal';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Loader from '../../components/Loader';
import { getUserBlockList, unBlockUser } from '../../store/slices/homeSlice';
import { useAppDispatch } from '../../hooks/storeHooks';
import { getMessage, Toast } from '../../utils/helpers';

const BlockedUsers: React.FC = () => {
    const navigation = useNavigation()
    const dispatch = useAppDispatch();
    const isFoused = useIsFocused();

    const [blockVisible, setBlockVisible] = useState(false);
    const [blockSuccess, setBlockSuccess] = useState(false);
    const [loading, setLoading] = useState(false)
    const [blockList, setBlockList] = useState([])

    useLayoutEffect(() => {
        navigation.setOptions({

            headerRight: () => (
                <TouchableOpacity style={styles.headerBtn}
                // onPress={() => navigation.navigate("AddProduct")}
                >
                    <Image
                        source={images.searchIcon}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);


    useEffect(() => {
        getApi()
    }, [isFoused])


    const getApi = async () => {
        setLoading(true)
        const checkData = await dispatch(getUserBlockList());
        setBlockList(checkData?.payload?.data?.data?.data);
        setLoading(false)
        console.log(checkData?.payload?.data?.data?.data, "checkkkkmetee")

    }

    if (loading) {
        return <Loader />;
    }





    const handleBlockButton = (userId: string) => {
        setBlockVisible(true)
    };


    const handleUnBlockUser = id => {
        dispatch(unBlockUser(id))
            .unwrap()
            .then(res => {
                // setBlockVisible(false);
                // setBlockSuccess(true);
                getApi();
                console.log('response from unblock Usere', res);
            })
            .catch(err => {
                Toast.error(getMessage(err?.message));
                console.log('err from unblock Usere', err);
            });
    };

    // Simulated data, replace with actual data fetching logic
    // const blockList = [

    //     { id: 1, userAvatar: 'avatar1.jpg', name: 'Marvel Edward', type: 'follow' },
    //     { id: 2, userAvatar: 'avatar2.jpg', name: 'Madvin', type: 'follow' },
    //     { id: 3, userAvatar: 'avatar3.jpg', name: 'Marvel Edward', type: 'follow' },
    //     { id: 4, userAvatar: 'avatar2.jpg', name: 'Juliana David', type: 'follow' },
    //     { id: 5, userAvatar: 'avatar2.jpg', name: 'Roy Rose', type: 'follow' },
    //     { id: 6, userAvatar: 'avatar2.jpg', name: 'Marvel Edward', type: 'remove' },
    //     { id: 7, userAvatar: 'avatar2.jpg', name: 'Colin Shaien', type: 'remove' },
    //     { id: 8, userAvatar: 'avatar2.jpg', name: 'Sam Alex', type: 'unfollow' },
    //     { id: 9, userAvatar: 'avatar2.jpg', name: 'Peter Parker', type: 'unfollow' },
    //     { id: 10, userAvatar: 'avatar1.jpg', name: 'Marvel Edward', type: 'follow' },
    //     { id: 11, userAvatar: 'avatar2.jpg', name: 'Madvin', type: 'remove' },
    //     { id: 12, userAvatar: 'avatar3.jpg', name: 'Marvel Edward', type: 'follow' },
    //     { id: 13, userAvatar: 'avatar2.jpg', name: 'Juliana David', type: 'remove' },
    //     { id: 14, userAvatar: 'avatar2.jpg', name: 'Roy Rose', type: 'follow' },
    //     { id: 15, userAvatar: 'avatar2.jpg', name: 'Marvel Edward', type: 'remove' },
    //     { id: 16, userAvatar: 'avatar2.jpg', name: 'Colin Shaien', type: 'remove' },
    //     { id: 17, userAvatar: 'avatar2.jpg', name: 'Sam Alex', type: 'unfollow' },
    //     { id: 18, userAvatar: 'avatar2.jpg', name: 'Peter Parker', type: 'unfollow' },
    // ];

    const renderUserItem = ({ item }: { item: { id: string, name: string, type: string } }) => (
        <>
            <View style={styles.userItem}>
                <View style={styles.avatarConatiner}>
                    <Image source={item?.avatar ? { uri: item?.avatar } : images.user} style={styles.userAvatar} />
                    <InterRegular style={styles.userName}>{item.name}</InterRegular>
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleUnBlockUser(item.id)}
                >
                    <InterRegular style={styles.actionButtonText}>Unblock</InterRegular>
                </TouchableOpacity>



            </View>
            <HorizontalSeparator />
        </>
    );


    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <InterRegular style={styles.emptyText}>No Blocked Users to Show.</InterRegular>
        </View>
    );


    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>


                <Card>


                    <FlatList
                        data={blockList}
                        renderItem={renderUserItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.contentContainer}
                        ListEmptyComponent={renderEmpty}

                    />
                </Card>

                <GeneralModal
                    visible={blockVisible}
                    closeModal={() => setBlockVisible(false)}
                    icon={images.qmark}
                    title='Unblock User'
                    message='Are you sure you want to unblock this user?'
                    SecondaryText1='Yes'
                    SecondaryText2='No'
                    onPress={() => {
                        setBlockVisible(false)
                        setBlockSuccess(true)

                    }}
                    secondaryBtn={true}
                />

                <GeneralModal
                    visible={blockSuccess}
                    closeModal={() => setBlockSuccess(false)}
                    icon={images.checkedIcon}
                    title='Unblock User'
                    message='User has been unblocked successfully!'
                    buttonText='Ok'
                    onPress={() => {
                        setBlockSuccess(false)
                        // navigation.navigate("Profile", { account: account })
                    }}
                    primaryBtn={true}
                />

            </View>
        </ScrollView>
    );
};

export default BlockedUsers;
