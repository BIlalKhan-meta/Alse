import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {CropAspect} from '../../../types/mediaEditor';
import styles from '../styles';

const ASPECT_OPTIONS: CropAspect[] = ['original', '1:1', '4:5', '16:9'];

type Props = {
  aspect: CropAspect;
  onSelectAspect: (aspect: CropAspect) => void;
  onReset: () => void;
};

const CropControls: React.FC<Props> = ({aspect, onSelectAspect, onReset}) => {
  const {t} = useTranslation();

  const aspectLabel = (value: CropAspect) => {
    switch (value) {
      case 'original':
        return t('aspectOriginal');
      case '1:1':
        return '1:1';
      case '4:5':
        return '4:5';
      case '16:9':
        return '16:9';
      default:
        return value;
    }
  };

  return (
    <View style={styles.cropControls}>
      <Text style={styles.cropHint}>{t('cropHint')}</Text>
      <View style={styles.aspectRow}>
        {ASPECT_OPTIONS.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.aspectChip,
              aspect === option && styles.aspectChipActive,
            ]}
            onPress={() => onSelectAspect(option)}>
            <Text
              style={[
                styles.aspectChipText,
                aspect === option && styles.aspectChipTextActive,
              ]}>
              {aspectLabel(option)}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.resetChip} onPress={onReset}>
          <Text style={styles.resetChipText}>{t('reset')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CropControls;
