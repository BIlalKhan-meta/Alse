import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import styles from './styles';
import { images } from '../../utils/images';
import Card from '../../components/Card';

const SavedChatDetail: React.FC = () => {
    const chatDetails = [
        {
            id: '1',
            message: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
            timestamp: '3d ago',
        },
        {
            id: '2',
            message: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
            timestamp: '3d ago',
        },
        {
            id: '3',
            message: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
            timestamp: '3d ago',
        },
    ];

    const renderMessage = ({ item, index }: { item: any, index: number }) => {
        const isLeft = index % 2 === 0; // Alternate messages between left and right

        return (
            <View style={[styles.messageContainer, isLeft ? styles.leftMessage : styles.rightMessage]}>
                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={styles.messageTime}>{item.timestamp}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>

            <Card>

                <View style={styles.chatHeader}>
                    <Image source={images.recordingIcon} style={styles.chatIcon} />
                    <View>
                        <Text style={styles.chatTitle}>Chat</Text>
                        <Text style={styles.chatSubtitle}>06:00 PM • 12/12/2024</Text>
                    </View>
                </View>

                <FlatList
                    data={chatDetails}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                />
            </Card>
        </View>
    );
};

export default SavedChatDetail;
