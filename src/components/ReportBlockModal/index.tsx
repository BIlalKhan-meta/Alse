import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import styles from './styles';
const windowWidth = Dimensions.get('window').width;

interface ReportBlockModalProps {
    isVisible: boolean;
    onReportPress: () => void;
    onBlockPress: () => void;
    onClose: () => void;
}

const ReportBlockModal: React.FC<ReportBlockModalProps> = ({ isVisible, onReportPress, onBlockPress, onClose }) => {

    return (


        <Modal
            // animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => onClose()}
        >
            <TouchableOpacity
                style={styles.modalBackground}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={[styles.modalContainer,]}>
                    <TouchableOpacity style={styles.modalOption} onPress={onReportPress}>
                        <Text>Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalOption} onPress={onBlockPress}>
                        <Text>Block</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};



export default ReportBlockModal;
