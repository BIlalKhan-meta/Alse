import {Minus, Plus} from 'lucide-react-native';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  TEXT_BACKGROUND_OPACITIES,
  TEXT_COLORS,
  TEXT_SIZES,
  TextOverlayState,
} from '../../../types/mediaEditor';
import styles from '../styles';

type Props = {
  overlay: TextOverlayState;
  onChange: (next: TextOverlayState) => void;
};

const TextStylePanel: React.FC<Props> = ({overlay, onChange}) => {
  const {t} = useTranslation();

  const sizeIndex = Math.max(
    0,
    TEXT_SIZES.findIndex(size => size === overlay.fontSize),
  );

  const decreaseSize = () => {
    const nextIndex = Math.max(0, sizeIndex - 1);
    onChange({...overlay, fontSize: TEXT_SIZES[nextIndex]});
  };

  const increaseSize = () => {
    const nextIndex = Math.min(TEXT_SIZES.length - 1, sizeIndex + 1);
    onChange({...overlay, fontSize: TEXT_SIZES[nextIndex]});
  };

  return (
    <View style={styles.textStylePanel}>
      <Text style={styles.textStyleSectionLabel}>{t('textColor')}</Text>
      <View style={styles.colorRow}>
        {TEXT_COLORS.map(color => {
          const selected = overlay.color === color;
          const isLight = color === '#FFFFFF' || color === '#FFCC00';
          return (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorSwatch,
                {backgroundColor: color},
                isLight && styles.colorSwatchBorder,
                selected && styles.colorSwatchSelected,
              ]}
              onPress={() => onChange({...overlay, color})}
            />
          );
        })}
      </View>

      <Text style={styles.textStyleSectionLabel}>{t('textSize')}</Text>
      <View style={styles.sizeRow}>
        <TouchableOpacity style={styles.sizeButton} onPress={decreaseSize}>
          <Minus color="#333" size={18} />
        </TouchableOpacity>
        <Text style={styles.sizeValue}>{overlay.fontSize}</Text>
        <TouchableOpacity style={styles.sizeButton} onPress={increaseSize}>
          <Plus color="#333" size={18} />
        </TouchableOpacity>
      </View>

      <Text style={styles.textStyleSectionLabel}>{t('textBackground')}</Text>
      <View style={styles.bgToggleRow}>
        <TouchableOpacity
          style={[
            styles.bgToggleChip,
            overlay.backgroundEnabled && styles.bgToggleChipActive,
          ]}
          onPress={() => onChange({...overlay, backgroundEnabled: true})}>
          <Text
            style={[
              styles.bgToggleChipText,
              overlay.backgroundEnabled && styles.bgToggleChipTextActive,
            ]}>
            {t('backgroundOn')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.bgToggleChip,
            !overlay.backgroundEnabled && styles.bgToggleChipActive,
          ]}
          onPress={() => onChange({...overlay, backgroundEnabled: false})}>
          <Text
            style={[
              styles.bgToggleChipText,
              !overlay.backgroundEnabled && styles.bgToggleChipTextActive,
            ]}>
            {t('backgroundOff')}
          </Text>
        </TouchableOpacity>
      </View>

      {overlay.backgroundEnabled ? (
        <>
          <Text style={styles.textStyleSectionLabel}>
            {t('backgroundOpacity')}
          </Text>
          <View style={styles.opacityRow}>
            {TEXT_BACKGROUND_OPACITIES.map(opacity => {
              const selected = overlay.backgroundOpacity === opacity;
              return (
                <TouchableOpacity
                  key={opacity}
                  style={[
                    styles.opacityChip,
                    selected && styles.opacityChipActive,
                  ]}
                  onPress={() =>
                    onChange({...overlay, backgroundOpacity: opacity})
                  }>
                  <Text
                    style={[
                      styles.opacityChipText,
                      selected && styles.opacityChipTextActive,
                    ]}>
                    {Math.round(opacity * 100)}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
};

export default TextStylePanel;
