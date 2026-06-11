import {GripHorizontal} from 'lucide-react-native';
import React, {useCallback, useMemo} from 'react';
import {TextInput, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {TextOverlayState} from '../../../types/mediaEditor';
import styles from '../styles';

type Props = {
  overlay: TextOverlayState | null;
  cardWidth: number;
  cardHeight: number;
  editable: boolean;
  draggable: boolean;
  placeholder: string;
  onChange: (next: TextOverlayState) => void;
};

const TextOverlayLayer: React.FC<Props> = ({
  overlay,
  cardWidth,
  cardHeight,
  editable,
  draggable,
  placeholder,
  onChange,
}) => {
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

  const commitPosition = useCallback(
    (x: number, y: number) => {
      if (!overlay) {
        return;
      }

      const maxX = Math.max(0, cardWidth - 40);
      const maxY = Math.max(0, cardHeight - 24);

      onChange({
        ...overlay,
        x: Math.max(0, Math.min(maxX, x)),
        y: Math.max(0, Math.min(maxY, y)),
      });
    },
    [cardHeight, cardWidth, onChange, overlay],
  );

  const finishDrag = useCallback(
    (x: number, y: number) => {
      isDragging.current = false;
      commitPosition(x, y);
    },
    [commitPosition],
  );

  const pan = useMemo(() => {
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
    ? `rgba(255,255,255,${overlay.backgroundOpacity})`
    : 'transparent';

  const content = (
    <Animated.View
      style={[
        styles.textOverlayBox,
        {
          width: overlay.width,
          backgroundColor,
        },
        animatedStyle,
      ]}>
      {editable ? (
        <GestureDetector gesture={pan}>
          <View style={styles.textDragHandle} hitSlop={8}>
            <GripHorizontal color="#666" size={16} />
          </View>
        </GestureDetector>
      ) : null}
      <TextInput
        style={[
          styles.textOverlayInput,
          {
            color: overlay.color,
            fontSize: overlay.fontSize,
          },
        ]}
        value={overlay.text}
        onChangeText={text => onChange({...overlay, text})}
        placeholder={placeholder}
        placeholderTextColor="#666"
        multiline
        editable={editable}
        pointerEvents={editable ? 'auto' : 'none'}
        autoFocus={editable && overlay.text === ''}
      />
    </Animated.View>
  );

  if (editable) {
    return content;
  }

  return <GestureDetector gesture={pan}>{content}</GestureDetector>;
};

export default TextOverlayLayer;
