import React from 'react';
import Row from '../Row';
import {Image, StyleSheet} from 'react-native';
import InterRegular from '../Text/InterRegular';
import CustomButton from '../CustomButton';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

export const FollowingCard = ({onPress, text, item}) => {
  return (
    <Row justify="space-between" style={{marginVertical: 0, flex: 1}}>
      <Row style={{marginVertical: 0}}>
        <Image
          source={item?.avatar ? {uri: item?.avatar} : images.user}
          style={styles.userAvatar}
        />
        <InterRegular style={styles.userName}>{item?.name}</InterRegular>
      </Row>
      <CustomButton
        onPress={onPress}
        style={styles.secondaryBtn1}
        containerStyle={styles.buttonContainerStyle}
        txtstyle={styles.btnTxt}>
        {text}
      </CustomButton>
    </Row>
  );
};

export const styles = StyleSheet.create({
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.lightGrey,
  },
  userName: {
    fontSize: fontSizes.f14,
    color: colors.black,
    marginLeft: vw * 2,
  },
  avatarConatiner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  secondaryBtn1: {
    minWidth: vw * 24,
    height: vh * 4,
    marginTop: 0,
  },
  secondaryBtn2: {
    width: vw * 18,
    height: vh * 5,
    backgroundColor: colors.white,
  },
  buttonContainerStyle: {
    marginTop: 0,
  },
  btnTxt: {
    fontSize: fontSizes.f12,
  },
});
