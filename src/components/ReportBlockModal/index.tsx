import React from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import styles from './styles';

const windowWidth = Dimensions.get('window').width;

interface ReportBlockModalProps {
    isVisible: boolean;
    reportButtonText: string;
    blockButtonText: string;
    onReportPress: () => void;
    onBlockPress: () => void;
    onClose: () => void;
}

const ReportBlockModal: React.FC<ReportBlockModalProps> = ({
    isVisible,
    reportButtonText,
    blockButtonText,
    onReportPress,
    onBlockPress,
    onClose,
}) => {

    return (
        <Modal
            transparent={true}
            visible={isVisible}
            onRequestClose={() => onClose()}
        >
            <TouchableOpacity
                style={styles.modalBackground}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContainer}>
                    {reportButtonText && (
                        <TouchableOpacity style={styles.modalOption} onPress={onReportPress}>
                            <Text>{reportButtonText}</Text>
                        </TouchableOpacity>
                    )}
                    {blockButtonText && (
                        <TouchableOpacity style={styles.modalOption} onPress={onBlockPress}>
                            <Text>{blockButtonText}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export default ReportBlockModal;
