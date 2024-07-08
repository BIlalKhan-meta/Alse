import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';
import { vh } from '../../constant';

interface HorizontalSeparatorProps {
    color?: string;
    thickness?: number;
}

const HorizontalSeparator: React.FC<HorizontalSeparatorProps> = ({ color, thickness }) => {
    return (
        <View style={[styles.separator]} />
    );
}

const styles = StyleSheet.create({
    separator: {
        // width: '100%',
        width: "100%",
        backgroundColor: colors.borderColor,
        height: vh * 0.1,
        marginVertical: vh * 1
    },
});

export default HorizontalSeparator;
