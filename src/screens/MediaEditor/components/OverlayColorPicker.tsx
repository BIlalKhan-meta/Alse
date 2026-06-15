import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Modal,
  PanResponder,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';
import styles from '../styles';
import {hexToHsv, hsvToHex, normalizeHex} from '../utils/color';

const HUE_COLORS = [
  '#FF0000',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#0000FF',
  '#FF00FF',
  '#FF0000',
];

type Props = {
  label: string;
  value: string;
  onChange: (hex: string) => void;
};

type LayoutSize = {
  width: number;
  height: number;
};

const OverlayColorPicker: React.FC<Props> = ({label, value, onChange}) => {
  const {t} = useTranslation();
  const [visible, setVisible] = useState(false);
  const [draftHex, setDraftHex] = useState(normalizeHex(value));
  const [draftHsv, setDraftHsv] = useState(() => hexToHsv(value));
  const [svLayout, setSvLayout] = useState<LayoutSize>({width: 1, height: 1});
  const [hueLayoutWidth, setHueLayoutWidth] = useState(1);

  const draftHsvRef = useRef(draftHsv);
  draftHsvRef.current = draftHsv;

  const openPicker = () => {
    const normalized = normalizeHex(value);
    setDraftHex(normalized);
    setDraftHsv(hexToHsv(normalized));
    setVisible(true);
  };

  const applyHsv = useCallback((h: number, s: number, v: number) => {
    const nextHsv = {h, s, v};
    const nextHex = hsvToHex(nextHsv);
    draftHsvRef.current = nextHsv;
    setDraftHsv(nextHsv);
    setDraftHex(nextHex);
  }, []);

  const pickSv = useCallback(
    (x: number, y: number) => {
      const width = Math.max(svLayout.width, 1);
      const height = Math.max(svLayout.height, 1);
      const s = Math.max(0, Math.min(1, x / width));
      const v = Math.max(0, Math.min(1, 1 - y / height));
      applyHsv(draftHsvRef.current.h, s, v);
    },
    [applyHsv, svLayout.height, svLayout.width],
  );

  const pickHue = useCallback(
    (x: number) => {
      const width = Math.max(hueLayoutWidth, 1);
      const h = Math.max(0, Math.min(360, (x / width) * 360));
      applyHsv(h, draftHsvRef.current.s, draftHsvRef.current.v);
    },
    [applyHsv, hueLayoutWidth],
  );

  const svResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => {
          pickSv(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderMove: event => {
          pickSv(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
      }),
    [pickSv],
  );

  const hueResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => {
          pickHue(event.nativeEvent.locationX);
        },
        onPanResponderMove: event => {
          pickHue(event.nativeEvent.locationX);
        },
      }),
    [pickHue],
  );

  const commitDraft = () => {
    onChange(hsvToHex(draftHsvRef.current));
    setVisible(false);
  };

  const huePreview = hsvToHex({h: draftHsv.h, s: 1, v: 1});
  const svThumbLeft = draftHsv.s * svLayout.width - 9;
  const svThumbTop = (1 - draftHsv.v) * svLayout.height - 9;
  const hueThumbLeft = (draftHsv.h / 360) * hueLayoutWidth - 11;

  return (
    <>
      <TouchableOpacity
        style={styles.colorPickerTrigger}
        onPress={openPicker}
        activeOpacity={0.85}>
        <View
          style={[
            styles.colorPickerSwatch,
            {backgroundColor: normalizeHex(value)},
          ]}
        />
        <View style={styles.colorPickerTriggerTextWrap}>
          <Text style={styles.colorPickerTriggerLabel}>{label}</Text>
          <Text style={styles.colorPickerTriggerValue}>
            {normalizeHex(value)}
          </Text>
        </View>
        <Text style={styles.colorPickerTriggerAction}>{t('chooseColor')}</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <View style={styles.colorPickerBackdrop}>
          <Pressable
            style={styles.colorPickerBackdropPress}
            onPress={() => setVisible(false)}
          />
          <View style={styles.colorPickerModal}>
            <Text style={styles.colorPickerModalTitle}>{label}</Text>

            <View
              style={[styles.colorPickerPreview, {backgroundColor: draftHex}]}
            />

            <View
              style={styles.colorPickerSvPanel}
              onLayout={event => {
                const {width, height} = event.nativeEvent.layout;
                setSvLayout({width, height});
              }}
              {...svResponder.panHandlers}>
              <View
                style={[styles.colorPickerSvBase, {backgroundColor: huePreview}]}
              />
              <LinearGradient
                colors={['#FFFFFF', 'rgba(255,255,255,0)']}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}
                style={styles.colorPickerSvOverlay}
                pointerEvents="none"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0)', '#000000']}
                start={{x: 0.5, y: 0}}
                end={{x: 0.5, y: 1}}
                style={styles.colorPickerSvOverlay}
                pointerEvents="none"
              />
              <View
                pointerEvents="none"
                style={[
                  styles.colorPickerThumb,
                  {
                    left: Math.max(-9, Math.min(svLayout.width - 9, svThumbLeft)),
                    top: Math.max(-9, Math.min(svLayout.height - 9, svThumbTop)),
                  },
                ]}
              />
            </View>

            <View
              style={styles.colorPickerHueTrack}
              onLayout={event => {
                setHueLayoutWidth(event.nativeEvent.layout.width);
              }}
              {...hueResponder.panHandlers}>
              <LinearGradient
                colors={HUE_COLORS}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}
                style={styles.colorPickerHueGradient}
                pointerEvents="none"
              />
              <View
                pointerEvents="none"
                style={[
                  styles.colorPickerHueThumb,
                  {
                    left: Math.max(
                      -11,
                      Math.min(hueLayoutWidth - 11, hueThumbLeft),
                    ),
                    backgroundColor: huePreview,
                  },
                ]}
              />
            </View>

            <View style={styles.colorPickerHexRow}>
              <Text style={styles.colorPickerHexLabel}>#</Text>
              <TextInput
                style={styles.colorPickerHexInput}
                value={draftHex.replace('#', '')}
                onChangeText={text => {
                  const cleaned = text
                    .replace(/[^0-9a-fA-F]/g, '')
                    .slice(0, 6)
                    .toUpperCase();
                  if (cleaned.length === 6) {
                    const normalized = normalizeHex(`#${cleaned}`);
                    setDraftHex(normalized);
                    setDraftHsv(hexToHsv(normalized));
                    draftHsvRef.current = hexToHsv(normalized);
                  } else {
                    setDraftHex(`#${cleaned}`);
                  }
                }}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>

            <View style={styles.colorPickerActions}>
              <TouchableOpacity
                style={styles.colorPickerCancelButton}
                onPress={() => setVisible(false)}>
                <Text style={styles.colorPickerCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.colorPickerApplyButton}
                onPress={commitDraft}>
                <Text style={styles.colorPickerApplyText}>{t('apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default OverlayColorPicker;
