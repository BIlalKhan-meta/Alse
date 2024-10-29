import React, {FC} from 'react';
import {Image, Modal, TouchableOpacity, View} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {styles} from './styles';
import {vh} from '../../constant';
import {images} from '../../utils/images';
import InterMedium from '../Text/InterMedium';
import CustomButton from '../CustomButton';
import {colors} from '../../utils/theme';
import InterBold from '../Text/InterBold';
import InterBoldLabel from '../Text/InterBoldLabel';

interface IDialoxgBox {
  visible: boolean;
  button?: {text: string; onPress?: () => void; isLoading?: boolean}[];
  onClose: () => void;
  heading: string;
  status?: 'correct' | 'upload' | 'warning';
}

export const DialogBox: FC<IDialoxgBox> = ({
  visible,
  button = [{text: 'Ok', isLoading: false}],
  onClose,
  heading,
  status = 'correct',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView
        style={styles.absoluteStyle}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      <View style={styles.modalContainer}>
        <View style={styles.dialogContainer}>
          <TouchableOpacity onPress={onClose} style={styles.crossContainer}>
            <Image
              source={images.cross}
              style={{width: vh * 1.5, height: vh * 1.5}}
            />
          </TouchableOpacity>
          <Image
            source={
              //   status == 'upload'
              //     ? images.upload
              //     : status == 'warning'
              //     ? images.warning
              //     : images.correct
              images.upload
            }
            style={[
              {width: vh * 12, height: vh * 12, alignSelf: 'center'},
              status == 'upload' && {tintColor: colors.themeColor},
            ]}
          />
          <InterBoldLabel style={styles.textStyle}>{heading}</InterBoldLabel>
          <View>
            {button.map((x, i) => {
              return (
                <CustomButton
                  loading={x.isLoading}
                  disable={x.isLoading}
                  onPress={x.onPress || onClose}
                  //   secondary={i == 1 && true}
                  key={i}
                  style={{
                    alignSelf: 'center',
                    marginBottom: i == 1 ? vh * 3 : vh,
                    width: '60%',
                  }}>
                  {x.text}
                </CustomButton>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};
