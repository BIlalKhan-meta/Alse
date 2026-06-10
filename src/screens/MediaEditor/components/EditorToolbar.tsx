import {Crop} from 'lucide-react-native';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {EditorTool} from '../../../types/mediaEditor';
import styles from '../styles';

type Props = {
  activeTool: EditorTool;
  onSelectCrop: () => void;
  onSelectText: () => void;
};

const EditorToolbar: React.FC<Props> = ({
  activeTool,
  onSelectCrop,
  onSelectText,
}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.toolbar}>
      <TouchableOpacity style={styles.toolButton} onPress={onSelectCrop}>
        <View style={styles.toolIconWrap}>
          <Crop
            color={activeTool === 'crop' ? '#20B2AA' : '#000'}
            size={28}
            strokeWidth={1.5}
          />
        </View>
        <Text
          style={[
            styles.toolLabel,
            activeTool === 'crop' && styles.toolLabelActive,
          ]}>
          {t('crop')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toolButton} onPress={onSelectText}>
        <View style={styles.toolIconWrap}>
          <Text
            style={[
              styles.serifA,
              activeTool === 'text' && styles.serifAActive,
            ]}>
            A
          </Text>
        </View>
        <Text
          style={[
            styles.toolLabel,
            activeTool === 'text' && styles.toolLabelActive,
          ]}>
          {t('text')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditorToolbar;
