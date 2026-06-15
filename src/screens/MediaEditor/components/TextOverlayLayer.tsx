import {GripHorizontal} from 'lucide-react-native';
import React, {useCallback, useMemo, useRef} from 'react';
import {Text, TextInput, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {hexToRgba, TextOverlayState} from '../../../types/mediaEditor';
import styles from '../styles';

type Props = {
  overlay: TextOverlayState | null;
  cardWidth: number;
  cardHeight: number;
  editable: boolean;
  draggable: boolean;
  exportMode?: boolean;
  placeholder: string;
  onChange: (next: TextOverlayState) => void;
  onDragEnd?: (overlay: TextOverlayState) => void;
};

const TextOverlayLayer: React.FC<Props> = ({
  overlay,
  cardWidth,
  cardHeight,
  editable,
  draggable,
  exportMode = false,
  placeholder,
  onChange,
  onDragEnd,
}) => {
  const inputRef = useRef<TextInput>(null);
  const posX = useSharedValue(overlay?.x ?? cardWidth * 0.1);
  const posY = useSharedValue(overlay?.y ?? cardHeight * 0.55);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = React.useRef(false);

  React.useEffect(() => {
    if (overlay && !isDragging.current) {
      posX.value = overlay.x;
      posY.value = overlay.y;
    }
  }, [overlay?.x, overlay?.y, overlay, posX, posY]);

  const finishDrag = useCallback(
    (x: number, y: number) => {
      if (!overlay) {
        return;
      }
      isDragging.current = false;

      const boxWidth = overlay.width ?? 120;
      const boxHeight = overlay.height ?? 56;
      const maxX = Math.max(0, cardWidth - boxWidth);
      const maxY = Math.max(0, cardHeight - boxHeight);
      const next = {
        ...overlay,
        x: Math.max(0, Math.min(maxX, x)),
        y: Math.max(0, Math.min(maxY, y)),
      };
      onChange(next);
      onDragEnd?.(next);
    },
    [cardHeight, cardWidth, onChange, onDragEnd, overlay],
  );

  const handlePan = useMemo(() => {
    return Gesture.Pan()
      .enabled(draggable && !!overlay)
      .minDistance(4)
      .onStart(() => {
        isDragging.current = true;
        startX.value = posX.value;
        startY.value = posY.value;
      })
      .onUpdate(event => {
        posX.value = startX.value + event.translationX;
        posY.value = startY.value + event.translationY;
      })
      .onEnd(() => {
        runOnJS(finishDrag)(posX.value, posY.value);
      })
      .onFinalize(() => {
        isDragging.current = false;
      });
  }, [draggable, finishDrag, overlay, posX, posY, startX, startY]);

  const animatedStyle = useAnimatedStyle(() => ({
    left: posX.value,
    top: posY.value,
  }));

  if (!overlay) {
    return null;
  }

  const backgroundColor = overlay.backgroundEnabled
    ? hexToRgba(
        overlay.backgroundColor ?? '#FFFFFF',
        overlay.backgroundOpacity,
      )
    : 'transparent';

  const showDragHandle = draggable && !exportMode;
  const textStyle = {
    color: overlay.color,
    fontSize: overlay.fontSize,
  };

  return (
    <Animated.View
      style={[
        styles.textOverlayBox,
        exportMode && styles.textOverlayBoxExport,
        {
          width: overlay.width,
          height: overlay.height,
          backgroundColor,
        },
        animatedStyle,
      ]}>
      {showDragHandle ? (
        <GestureDetector gesture={handlePan}>
          <View style={styles.textDragHandle}>
            <GripHorizontal color="#666" size={14} />
          </View>
        </GestureDetector>
      ) : null}
      {exportMode ? (
        <Text style={[styles.textOverlayExportText, textStyle]}>{overlay.text}</Text>
      ) : (
        <TextInput
          ref={inputRef}
          style={[
            styles.textOverlayInput,
            textStyle,
            {
              height: Math.max(28, overlay.height - (showDragHandle ? 28 : 0)),
            },
          ]}
          value={overlay.text}
          onChangeText={text => onChange({...overlay, text})}
          placeholder={placeholder}
          placeholderTextColor="#666"
          multiline
          editable={editable}
          onPressIn={() => {
            if (editable) {
              inputRef.current?.focus();
            }
          }}
        />
      )}
    </Animated.View>
  );
};

export default TextOverlayLayer;
