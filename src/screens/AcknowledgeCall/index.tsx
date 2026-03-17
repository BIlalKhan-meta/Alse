import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import InterRegular from '../../components/Text/InterRegular';
import {images} from '../../utils/images';
import {vh, vw} from '../../constant';
import {colors} from '../../utils/theme';
import Row from '../../components/Row';

const AcknowledgeCall = ({navigation, route}) => {
  const {chat_id, role, image, name} = route?.params;

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View style={styles.userContainer}>
        <Image
          source={image ? {uri: image} : images.user}
          style={styles.userImage}
        />
        <InterRegular style={styles.userName}>{name}</InterRegular>
      </View>

      <Row style={{width: vw * 80, marginTop: vh * 8}} justify="space-around">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.circle, {backgroundColor: colors.redStatus}]}>
          <Image source={images.cancelCall} style={styles.endCallIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ChatOngoing', {
              id: chat_id,
              receiverId: chat_id,
              name,
            })
          }
          style={styles.circle}>
          <Image source={images.endCall} style={styles.endCallIcon} />
        </TouchableOpacity>
      </Row>
    </View>
  );
};

const styles = StyleSheet.create({
  userContainer: {
    width: vh * 20,
    height: vh * 20,
    alignItems: 'center',
    marginVertical: vh,
  },
  userImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  circle: {
    width: vh * 6,
    height: vh * 6,
    borderRadius: vh * 6,
    backgroundColor: colors.themeColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    color: colors.black,
  },
  endCallIcon: {
    width: vh * 3,
    height: vh * 3,
    resizeMode: 'contain',
    tintColor: colors.white,
  },
});

export default AcknowledgeCall;
