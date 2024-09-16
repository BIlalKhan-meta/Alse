import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
import styles from './styles';
import { colors } from '../../utils/theme';
import { images } from '../../utils/images';
import Card from '../../components/Card';
import { useNavigation } from '@react-navigation/native';
import ReportBlockModal from '../../components/ReportBlockModal';

const SavedChat: React.FC = () => {
    const navigation = useNavigation();
    const [selectedChat, setSelectedChat] = useState<string | null>(null); // For handling the dropdown options for each item
    const [modalVisible, setModalVisible] = useState(false);

    const savedChats = [
        { id: '1', title: 'Abc', time: '06:00 PM', date: '12/12/2024' },
        { id: '2', title: 'Abc', time: '06:00 PM', date: '12/12/2024' },
        { id: '3', title: 'Abc', time: '06:00 PM', date: '12/12/2024' },
        { id: '4', title: 'Abc', time: '06:00 PM', date: '12/12/2024' },
        { id: '5', title: 'Abc', time: '06:00 PM', date: '12/12/2024' },
    ];


    const handleOptionSelect = (id: string) => {
        setSelectedChat(id === selectedChat ? null : id);
    };

    const handleDelete = (id: string) => {
        // Perform delete action
        console.log(`Deleting chat with id: ${id}`);
        setSelectedChat(null);
    };

    const handleRename = (id: string) => {
        // Perform rename action
        console.log(`Renaming chat with id: ${id}`);
        setSelectedChat(null);
    };

    const options = [
        { text: 'Delete', onPress: () => handleDelete() },
        { text: 'Rename', onPress: () => handleRename() },
    ];

    const renderChatItem = ({ item }: { item: any }) => (
        <>

            <TouchableOpacity style={styles.chatCard}
                onPress={() => navigation.navigate("SavedChatDetail")}
            >
                <View style={styles.chatInfo}>
                    <Image source={images.recordingIcon} style={styles.chatIcon} />
                    <View style={styles.chatDetails}>
                        <Text style={styles.chatTitle}>{item.title}</Text>
                        <Text style={styles.chatTime}>{item.time} • {item.date}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => handleOptionSelect(item.id)}>
                    <Image source={images.dots} style={styles.ellipsisIcon} />
                </TouchableOpacity>


                <ReportBlockModal
                    isVisible={selectedChat === item.id}
                    options={options}
                    onClose={() => setModalVisible(!modalVisible)}
                    style={{
                        top: 55,
                        right: 30,
                        zIndex: 10,

                    }}
                />
                {/* )} */}
            </TouchableOpacity>

        </>
    );

    return (
        <View style={styles.container}>

            <Card>

                <FlatList
                    data={savedChats}
                    renderItem={renderChatItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            </Card>
        </View>
    );
};

export default SavedChat;
