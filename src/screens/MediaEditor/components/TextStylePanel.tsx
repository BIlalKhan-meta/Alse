import {Minus, Plus} from 'lucide-react-native';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  TEXT_BACKGROUND_OPACITIES,
  TEXT_BOX_HEIGHT_STEP,
  TEXT_BOX_MIN_HEIGHT,
  TEXT_BOX_MIN_WIDTH,
  TEXT_BOX_WIDTH_STEP,
  TEXT_SIZES,
  TextOverlayState,
} from '../../../types/mediaEditor';
import OverlayColorPicker from './OverlayColorPicker';
import styles from '../styles';

type Props = {
  overlay: TextOverlayState;
  cardWidth: number;
  cardHeight: number;
  onChange: (next: TextOverlayState) => void;
};

const TextStylePanel: React.FC<Props> = ({
  overlay,
  cardWidth,
  cardHeight,
  onChange,
}) => {
  const {t} = useTranslation();

  const maxWidth = Math.round(cardWidth * 0.95);
  const maxHeight = Math.round(cardHeight * 0.6);

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

  const boxWidth = overlay.width ?? TEXT_BOX_MIN_WIDTH;
  const boxHeight = overlay.height ?? TEXT_BOX_MIN_HEIGHT;

  const adjustWidth = (delta: number) => {
    const nextWidth = Math.max(
      TEXT_BOX_MIN_WIDTH,
      Math.min(maxWidth, boxWidth + delta),
    );
    onChange({...overlay, width: nextWidth, height: boxHeight});
  };

  const adjustHeight = (delta: number) => {
    const nextHeight = Math.max(
      TEXT_BOX_MIN_HEIGHT,
      Math.min(maxHeight, boxHeight + delta),
    );
    onChange({...overlay, width: boxWidth, height: nextHeight});
  };

  return (
    <View style={styles.textStylePanel}>
      <OverlayColorPicker
        label={t('textColor')}
        value={overlay.color}
        onChange={color => onChange({...overlay, color})}
      />

      <Text style={styles.textStyleSectionLabel}>{t('textSize')}</Text>
      <View style={styles.sizeRow}>
        <TouchableOpacity style={styles.sizeButton} onPress={decreaseSize}>
          <Minus color="#333" size={16} />
        </TouchableOpacity>
        <Text style={styles.sizeValue}>{overlay.fontSize}</Text>
        <TouchableOpacity style={styles.sizeButton} onPress={increaseSize}>
          <Plus color="#333" size={16} />
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
          <OverlayColorPicker
            label={t('textBackgroundColor')}
            value={overlay.backgroundColor ?? '#FFFFFF'}
            onChange={backgroundColor =>
              onChange({...overlay, backgroundColor})
            }
          />

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

      <Text style={styles.textStyleSectionLabel}>{t('textBoxWidth')}</Text>
      <View style={styles.sizeRow}>
        <TouchableOpacity
          style={styles.sizeButton}
          onPress={() => adjustWidth(-TEXT_BOX_WIDTH_STEP)}>
          <Minus color="#333" size={16} />
        </TouchableOpacity>
        <Text style={styles.sizeValue}>{Math.round(boxWidth)}</Text>
        <TouchableOpacity
          style={styles.sizeButton}
          onPress={() => adjustWidth(TEXT_BOX_WIDTH_STEP)}>
          <Plus color="#333" size={16} />
        </TouchableOpacity>
      </View>

      <Text style={styles.textStyleSectionLabel}>{t('textBoxHeight')}</Text>
      <View style={styles.sizeRow}>
        <TouchableOpacity
          style={styles.sizeButton}
          onPress={() => adjustHeight(-TEXT_BOX_HEIGHT_STEP)}>
          <Minus color="#333" size={16} />
        </TouchableOpacity>
        <Text style={styles.sizeValue}>{Math.round(boxHeight)}</Text>
        <TouchableOpacity
          style={styles.sizeButton}
          onPress={() => adjustHeight(TEXT_BOX_HEIGHT_STEP)}>
          <Plus color="#333" size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TextStylePanel;
