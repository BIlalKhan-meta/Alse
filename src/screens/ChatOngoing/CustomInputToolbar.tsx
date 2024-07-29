import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { InputToolbar, InputToolbarProps, Composer } from 'react-native-gifted-chat';
import styles from './styles';
import { images } from '../../utils/images';
import { colors } from '../../utils/theme';

const CustomInputToolbar: React.FC<InputToolbarProps> = (props) => {
    return (
        <View style={styles.inputToolbarContainer}>
            <TouchableOpacity style={styles.leftButton}>
                <Image source={images.media} style={styles.mediaBtn} />
            </TouchableOpacity>
            <InputToolbar
                {...props}
                // containerStyle={styles.inputToolbar}
                containerStyle={styles.inputContainer}
                primaryStyle={styles.inputBox}
                renderComposer={(props) => (
                    <Composer {...props} textInputStyle={styles.composer} placeholder="Write a comment" />
                )}
            />
            {/* <TouchableOpacity style={styles.rightButton}>
                <Image source={images.likeFill} tintColor={colors.blue} style={styles.likeBtn} />

            </TouchableOpacity> */}
        </View>
    );
};

// const styles = StyleSheet.create({
//     inputToolbarContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderTopWidth: 1,
//         borderTopColor: colors.lightGray,
//         padding: 8,
//         // justifyContent: "space-between"
//     },
//     leftButton: {
//         paddingHorizontal: 10,
//         backgroundColor: "yellow",
//         zIndex: 100
//     },
//     rightButton: {
//         paddingHorizontal: 10,
//     },
//     inputToolbar: {
//         flex: 1,
//         borderRadius: 20,
//         borderWidth: 1,
//         borderColor: colors.lightGray,
//         paddingHorizontal: 10,
//     },
//     composer: {
//         paddingHorizontal: 10,
//     },
// });

export default CustomInputToolbar;
