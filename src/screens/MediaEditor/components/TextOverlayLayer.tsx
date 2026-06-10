import React from 'react';
import {TextInput, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import {TextOverlayState} from '../../../types/mediaEditor';
import styles from '../styles';

type Props = {
  overlay: TextOverlayState | null;
  cardWidth: number;
  cardHeight: number;
  editable: boolean;
  placeholder: string;
  onChange: (next: TextOverlayState) => void;
};

const TextOverlayLayer: React.FC<Props> = ({
  overlay,
  cardWidth,
  cardHeight,
  editable,
  placeholder,
  onChange,
}) => {
  const translateX = useSharedValue(overlay?.x ?? cardWidth * 0.05);
  const translateY = useSharedValue(overlay?.y ?? cardHeight * 0.62);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  React.useEffect(() => {
    if (overlay) {
      translateX.value = overlay.x;
      translateY.value = overlay.y;
    }
  }, [overlay, translateX, translateY]);

  const commitPosition = (x: number, y: number) => {
    if (!overlay) {
      return;
    }
    onChange({
      ...overlay,
      x: Math.max(0, Math.min(cardWidth - overlay.width, x)),
      y: Math.max(0, Math.min(cardHeight - 60, y)),
    });
  };

  const pan = Gesture.Pan()
    .enabled(editable && !!overlay)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate(event => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      runOnJS(commitPosition)(translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
  }));

  if (!overlay) {
    return null;
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.textOverlayBox,
          {width: overlay.width},
          animatedStyle,
        ]}>
        <TextInput
          style={styles.textOverlayInput}
          value={overlay.text}
          onChangeText={text => onChange({...overlay, text})}
          placeholder={placeholder}
          placeholderTextColor="#666"
          multiline
          editable={editable}
          autoFocus={editable && overlay.text === ''}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default TextOverlayLayer;
