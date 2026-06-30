import React from 'react';
import {Modal, Pressable, Text, TouchableOpacity, View} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useTranslation} from 'react-i18next';
import InterBoldSmall from '../Text/InterBoldSmall';
import InterLightAverage from '../Text/InterLightAverage';
import {WellnessThresholdMinutes} from '../../utils/feedSessionTracking';
import styles from './styles';

type FeedWellnessModalProps = {
  visible: boolean;
  minutes: WellnessThresholdMinutes;
  onClose: () => void;
  onCloseFeed: () => void;
};

const FeedWellnessModal: React.FC<FeedWellnessModalProps> = ({
  visible,
  minutes,
  onClose,
  onCloseFeed,
}) => {
  const {t} = useTranslation();

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
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
        activeOpacity={0.9}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('feed.wellnessClose')}
      />
      <View style={styles.centeredView} pointerEvents="box-none">
        <View style={styles.container}>
          <InterBoldSmall style={styles.title}>
            {t('feed.wellnessTitle')}
          </InterBoldSmall>
          <InterLightAverage style={styles.message}>
            {t('feed.wellnessMessage', {minutes})}
          </InterLightAverage>
          <View style={styles.buttonRow}>
            <Pressable
              onPress={onClose}
              testID="feed-wellness-close"
              accessibilityRole="button"
              accessibilityLabel={t('feed.wellnessClose')}
              style={({pressed}) => [
                styles.modalButton,
                styles.closeButton,
                pressed && styles.modalButtonPressed,
              ]}>
              <Text style={styles.closeButtonText}>{t('feed.wellnessClose')}</Text>
            </Pressable>
            <Pressable
              onPress={onCloseFeed}
              testID="feed-wellness-close-feed"
              accessibilityRole="button"
              accessibilityLabel={t('feed.wellnessCloseFeed')}
              style={({pressed}) => [
                styles.modalButton,
                styles.closeFeedButton,
                pressed && styles.closeFeedButtonPressed,
              ]}>
              <Text style={styles.closeFeedButtonText}>
                {t('feed.wellnessCloseFeed')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FeedWellnessModal;
