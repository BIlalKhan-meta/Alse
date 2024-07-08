import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import Card from '../../components/Card';
import styles from './styles';
import HeaderComponent from '../../components/HeaderComponent';
import InterRegular from '../../components/Text/InterRegular';
import { images } from '../../utils/images';
import HorizontalSeparator from '../../components/HorizontalSeparator';
import GeneralModal from '../../components/GeneralModal';

const BlockedUsers: React.FC = () => {
    const [blockVisible, setBlockVisible] = useState(false);
    const [blockSuccess, setBlockSuccess] = useState(false);

    const handleBlockButton = (userId: string) => {
        setBlockVisible(true)
    };

    // Simulated data, replace with actual data fetching logic
    const blockList = [

        { id: 1, userAvatar: 'avatar1.jpg', name: 'Marvel Edward', type: 'follow' },
        { id: 2, userAvatar: 'avatar2.jpg', name: 'Madvin', type: 'follow' },
        { id: 3, userAvatar: 'avatar3.jpg', name: 'Marvel Edward', type: 'follow' },
        { id: 4, userAvatar: 'avatar2.jpg', name: 'Juliana David', type: 'follow' },
        { id: 5, userAvatar: 'avatar2.jpg', name: 'Roy Rose', type: 'follow' },
        { id: 6, userAvatar: 'avatar2.jpg', name: 'Marvel Edward', type: 'remove' },
        { id: 7, userAvatar: 'avatar2.jpg', name: 'Colin Shaien', type: 'remove' },
        { id: 8, userAvatar: 'avatar2.jpg', name: 'Sam Alex', type: 'unfollow' },
        { id: 9, userAvatar: 'avatar2.jpg', name: 'Peter Parker', type: 'unfollow' },
        { id: 10, userAvatar: 'avatar1.jpg', name: 'Marvel Edward', type: 'follow' },
        { id: 11, userAvatar: 'avatar2.jpg', name: 'Madvin', type: 'remove' },
        { id: 12, userAvatar: 'avatar3.jpg', name: 'Marvel Edward', type: 'follow' },
        { id: 13, userAvatar: 'avatar2.jpg', name: 'Juliana David', type: 'remove' },
        { id: 14, userAvatar: 'avatar2.jpg', name: 'Roy Rose', type: 'follow' },
        { id: 15, userAvatar: 'avatar2.jpg', name: 'Marvel Edward', type: 'remove' },
        { id: 16, userAvatar: 'avatar2.jpg', name: 'Colin Shaien', type: 'remove' },
        { id: 17, userAvatar: 'avatar2.jpg', name: 'Sam Alex', type: 'unfollow' },
        { id: 18, userAvatar: 'avatar2.jpg', name: 'Peter Parker', type: 'unfollow' },
    ];

    const renderUserItem = ({ item }: { item: { id: string, name: string, type: string } }) => (
        <>
            <View style={styles.userItem}>
                <View style={styles.avatarConatiner}>
                    <Image source={images.user} style={styles.userAvatar} />
                    <InterRegular style={styles.userName}>{item.name}</InterRegular>
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleBlockButton(item.id)}
                >
                    <InterRegular style={styles.actionButtonText}>Unblock</InterRegular>
                </TouchableOpacity>



            </View>
            <HorizontalSeparator />
        </>
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                {/* Header */}
                <HeaderComponent
                    label={'Blocked Users'}
                    onBackPress={() => navigation.goBack()}
                    searchVisible={true}
                />

                <Card>


                    {/* Render user list based on active tab using FlatList */}
                    <FlatList
                        data={blockList}
                        renderItem={renderUserItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.contentContainer}
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
