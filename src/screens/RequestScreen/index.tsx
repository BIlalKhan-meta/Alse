import React, { useLayoutEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import Card from '../../components/Card';
import styles from './styles';
import HeaderComponent from '../../components/HeaderComponent';
import InterRegular from '../../components/Text/InterRegular';
import { images } from '../../utils/images';
import HorizontalSeparator from '../../components/HorizontalSeparator';
import { useNavigation } from '@react-navigation/native';
import InterBold from '../../components/Text/InterBold';

const RequestScreen: React.FC = () => {
    const navigation = useNavigation();

    const [active, setActive] = useState<number>(1);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTxt, setSearchTxt] = useState('');


    const handleActionButton = (type: string, userId: string) => {
        if (type === 'follow') {
            // Handle follow logic
            console.log(`Follow user with id ${userId}`);
        } else if (type === 'remove') {
            // Handle remove logic
            console.log(`Remove user with id ${userId}`);
        } else if (type === 'unfollow') {
            // Handle unfollow logic
            console.log(`Unfollow user with id ${userId}`);
        }
    };

    // Simulated data, replace with actual data fetching logic
    const userList = [

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
                {item.type === 'follow' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleActionButton('follow', item.id)}
                    >
                        <InterRegular style={styles.actionButtonText}>Follow Back</InterRegular>
                    </TouchableOpacity>
                )}
                {item.type === 'remove' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleActionButton('remove', item.id)}
                    >
                        <InterRegular style={styles.actionButtonText}>Remove</InterRegular>
                    </TouchableOpacity>
                )}
                {item.type === 'unfollow' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleActionButton('unfollow', item.id)}
                    >
                        <InterRegular style={styles.actionButtonText}>Unfollow</InterRegular>
                    </TouchableOpacity>
                )}

            </View>
            <HorizontalSeparator />
        </>
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => {
                        setShowSearch(!showSearch);
                        // setSearchTxt('');
                        // setSearchResults([]); // Clear search results
                        // setIsSearching(false); // Reset searching state
                    }}>
                    <Image source={images.searchIcon} style={styles.icon} />
                </TouchableOpacity>
            ),
            headerTitle: () => {
                return (
                    showSearch ? (
                        <View style={styles.searchContainer}>
                            <TextInput
                                value={searchTxt}
                                style={styles.searchInput}
                                placeholder="Search..."
                                // onSubmitEditing={() => getSearchChatApi()}
                                // onChangeText={text => setSearchTxt(text)}
                                returnKeyType="search"
                            />
                        </View>
                    ) : (
                        <>
                            <InterBold style={styles.title}>{active === 1 ? "Follow Request" : active === 2 ? "Followers" : "Following"}</InterBold>
                        </>
                    ))
            },

        });

    }, [navigation, showSearch, searchTxt, active]);

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container}>


                <Card>
                    <View style={styles.activeContainer}>
                        <TouchableOpacity
                            style={active === 1 ? styles.activeBtn : styles.inactiveBtn}
                            onPress={() => setActive(1)}
                        >
                            <InterRegular style={active === 1 ? styles.activeTxt : styles.inactiveTxt}>
                                Follow Request
                            </InterRegular>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={active === 2 ? styles.activeBtn : styles.inactiveBtn}
                            onPress={() => setActive(2)}
                        >
                            <InterRegular style={active === 2 ? styles.activeTxt : styles.inactiveTxt}>
                                Followers
                            </InterRegular>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={active === 3 ? styles.activeBtn : styles.inactiveBtn}
                            onPress={() => setActive(3)}
                        >
                            <InterRegular style={active === 3 ? styles.activeTxt : styles.inactiveTxt}>
                                Following
                            </InterRegular>
                        </TouchableOpacity>
                    </View>

                    {/* Render user list based on active tab using FlatList */}
                    <FlatList
                        data={userList.filter(user => {
                            if (active === 1) return user.type === 'follow';
                            if (active === 2) return user.type === 'remove';
                            if (active === 3) return user.type === 'unfollow';
                            return false;
                        })}
                        renderItem={renderUserItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.contentContainer}
                    />
                </Card>



            </View>
        </ScrollView>
    );
};

export default RequestScreen;
