import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { images } from '../../utils/images';
import { colors } from '../../utils/theme';
import styles from './styles';
import DropDownTextInput from '../../components/TextInput/DropDownTextInput';
import InterMedium from '../../components/Text/InterMedium';
import InterRegular from '../../components/Text/InterRegular';
import Card from '../../components/Card';
import GeneralModal from '../../components/GeneralModal';
import ReportBlockModal from '../../components/ReportBlockModal';
// import NewGroupModal from '../../components/GroupModel';

interface ChatItem {
    id: number;
    name: string;
    lastMessage: string;
    lastMessageTime: string;
    avatar: string;
    group: boolean;
}

const chatData: ChatItem[] = [
    {
        id: 1,
        name: 'Juliana John',
        lastMessage: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. ',
        lastMessageTime: '3d ago',
        avatar: `${images.user}`,
        group: false,
    },
    {
        id: 2,
        name: 'Food group',
        lastMessage: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. ',
        lastMessageTime: '1d ago',
        avatar: `${images.user2}`,
        group: true,
    },
    {
        id: 3,
        name: 'Jessy Roy',
        lastMessage: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. ',
        lastMessageTime: '2d ago',
        avatar: `${images.user}`,
        group: false,
    },
    {
        id: 4,
        name: 'Peter Tom',
        lastMessage: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. ',
        lastMessageTime: '3d ago',
        avatar: `${images.user2}`,
        group: false,
    },
];


interface User {
    id: number;
    avatar: string;
    name: string;
}

const usersData: User[] = [
    { id: 1, avatar: images.user, name: 'Marvel Edward' },
    { id: 2, avatar: images.user, name: 'Madvil' },
    { id: 3, avatar: images.user, name: 'Juliana David' },
    { id: 4, avatar: images.user, name: 'Roy Rose' },
    { id: 5, avatar: images.user, name: 'Marvel Edward' },
];



const ChatScreen: React.FC = () => {
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [reportVisible, setReportVisible] = useState(false);
    const [reportInput, setReportInput] = useState(false);
    const [ReportSuccess, setReportSuccess] = useState(false);
    const [blockVisible, setBlockVisible] = useState(false);
    const [blockSuccess, setBlockSuccess] = useState(false);
    const [linkVisible, setLinkVisible] = useState(false);
    const [activeChatId, setActiveChatId] = useState<number | null>(null);

    const openModal = (id: number) => {
        setActiveChatId(activeChatId === id ? null : id);

    };

    const closeModal = () => {
        setModalVisible(false);
    };
    const items = [
        { label: 'All', value: 'all' },
        { label: 'Read', value: 'read' },
        { label: 'Unread', value: 'unread' },
    ];
    const handleDropdownChange = (value: string | null) => {
        console.log('Selected value:', value);
    };
    useLayoutEffect(() => {
        navigation.setOptions({
            // headerShown: true,
            // headerTransparent: true,
            headerStyle: {
                backgroundColor: colors.headerColor
            },
            headerRight: () => (
                <TouchableOpacity style={styles.newGroupButton}
                    onPress={openModal}
                >

                    <Text style={styles.newGroupButtonText}>
                        New Group</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleReportPress = () => {
        setActiveChatId(null);
        setReportVisible(true)
    };

    const handleBlockPress = () => {
        setActiveChatId(null);
        setBlockVisible(true)
    };

    const handleGetLink = () => {
        setModalVisible(false);
        setLinkVisible(true)
    }

    const options = [
        // { text: 'Get Link', onPress: () => { handleGetLink(); } },
        { text: 'Leave', onPress: () => { handleReportPress(); } },
        // { text: 'Block', onPress: () => { handleBlockPress(); } },
    ];

    const options2 = [
        // { text: 'Get Link', onPress: () => { handleGetLink(); } },
        // { text: 'Report', onPress: () => { handleReportPress(); } },
        { text: 'Block', onPress: () => { handleBlockPress(); } },
    ];



    const renderItem = ({ item }: { item: ChatItem }) => (
        <TouchableOpacity style={styles.chatContainer}
            onPress={() => navigation.navigate("ChatOngoing")}
        >
            <View style={styles.chatItem}>
                <Image source={item.avatar} style={styles.avatar} />
                <View style={styles.chatInfo}>
                    <InterMedium style={styles.name}>{item.name}</InterMedium>
                    <Text style={styles.lastMessage}>{item.lastMessageTime}</Text>
                </View>
                {/* <View style={styles.chatActions}>

                    <TouchableOpacity
                        onPress={() => openModal(item.id)}
                    >
                        <Image source={images.dots} style={styles.dotStyle} />
                    </TouchableOpacity>

                    <ReportBlockModal
                        isVisible={activeChatId === item.id}
                        options={item.group ? options : options2}
                    // onClose={() => setActiveChatId(null)}
                    />
                </View> */}
            </View>
            <InterRegular style={styles.lastMessage}>{item.lastMessage}</InterRegular>
        </TouchableOpacity>
    );

    return (
        <TouchableWithoutFeedback
            onPress={() => setActiveChatId(null)}

        >


            <View style={styles.container}>

                <Card style={styles.cardStyle}>


                    <View style={styles.searchContainer}>


                        <View style={styles.inputContainer}>
                            <Image source={images.search} style={styles.searchIcon} />
                            <TextInput
                                placeholder='Search here'
                                placeholderTextColor={colors.darkText}
                            />
                        </View>

                        {/* <NewGroupModal visible={modalVisible} closeModal={closeModal} users={usersData} /> */}

                        <View style={styles.dropdownContainer}>
                            <DropDownTextInput
                                items={items}
                                defaultValue='all'
                                // placeholder="Select a fruit"
                                onChangeValue={handleDropdownChange}
                                style={styles.dropDown}
                            />
                        </View>
                    </View>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={chatData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.chatList}
                    />
                </Card>




                <GeneralModal
                    visible={reportVisible}
                    closeModal={() => setReportVisible(false)}
                    icon={images.qmark}
                    title='Leave Group'
                    message='Are you sure you want to leave this group?'
                    SecondaryText1='Yes'
                    SecondaryText2='No'
                    onPress={() => {
                        setReportVisible(false)
                        setReportSuccess(true)

                    }}
                    secondaryBtn={true}
                />



                <GeneralModal
                    visible={ReportSuccess}
                    closeModal={() => setReportSuccess(false)}
                    icon={images.checkedIcon}
                    title='Leave Group'
                    message='Group has been leave successfully.'
                    buttonText='Ok'
                    onPress={() => {
                        setReportSuccess(false)
                    }}
                    primaryBtn={true}
                />

                <GeneralModal
                    visible={blockVisible}
                    closeModal={() => setBlockVisible(false)}
                    icon={images.qmark}
                    title='Block User'
                    message='Are you sure you want to block this Group?'
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
                    title='Block User'
                    message='User has been blocked successfully!'
                    buttonText='Ok'
                    onPress={() => {
                        setBlockSuccess(false)

                    }}
                    primaryBtn={true}
                />

                <GeneralModal
                    visible={linkVisible}
                    closeModal={() => setLinkVisible(false)}
                    title='Get Link'
                    buttonText='COPY'
                    buttonText2='CANCEL'
                    smallButtons={true}
                    getLink={true}
                    onPress={() => {
                        setLinkVisible(false)

                    }}
                />
            </View>

        </TouchableWithoutFeedback>

    );
};



export default ChatScreen;
