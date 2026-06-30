import React from 'react';
import {Modal, TouchableOpacity, View} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useTranslation} from 'react-i18next';
import CustomButton from '../CustomButton';
import InterBoldSmall from '../Text/InterBoldSmall';
import InterLightAverage from '../Text/InterLightAverage';
import {WellnessThresholdMinutes} from '../../utils/feedSessionTracking';
import styles from './styles';

type FeedWellnessModalProps = {
  visible: boolean;
  minutes: WellnessThresholdMinutes;
  onContinue: () => void;
  onCloseFeed: () => void;
};

const FeedWellnessModal: React.FC<FeedWellnessModalProps> = ({
  visible,
  minutes,
  onContinue,
  onCloseFeed,
}) => {
  const {t} = useTranslation();

  return (
    <Modal
      visible={visible}
      onRequestClose={onContinue}
      animationType="slide"
      transparent
      testID="feed-wellness-modal">
      <BlurView
        style={styles.absolute}
        blurType="dark"
        blurAmount={1}
        reducedTransparencyFallbackColor="white"
      />
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityLabel={t('feed.wellnessContinue')}
      />
      <View style={styles.centeredView}>
        <View style={styles.container}>
          <InterBoldSmall style={styles.title}>
            {t('feed.wellnessTitle')}
          </InterBoldSmall>
          <InterLightAverage style={styles.message}>
            {t('feed.wellnessMessage', {minutes})}
          </InterLightAverage>
          <View style={styles.buttonRow}>
            <CustomButton
              onPress={onContinue}
              style={styles.continueButton}
              containerStyle={styles.buttonContainer}
              testID="feed-wellness-continue">
              {t('feed.wellnessContinue')}
            </CustomButton>
            <CustomButton
              onPress={onCloseFeed}
              style={styles.closeFeedButton}
              containerStyle={styles.buttonContainer}
              txtstyle={styles.closeFeedButtonText}
              testID="feed-wellness-close-feed">
              {t('feed.wellnessCloseFeed')}
            </CustomButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FeedWellnessModal;
