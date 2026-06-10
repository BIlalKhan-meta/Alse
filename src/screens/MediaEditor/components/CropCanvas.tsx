import React from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {CropAspect} from '../../../types/mediaEditor';
import {CropTransform, getCropFrameSize} from '../../../utils/mediaEditor';
import styles from '../styles';

type Props = {
  children: React.ReactNode;
  active: boolean;
  aspect: CropAspect;
  cardWidth: number;
  cardHeight: number;
  transform: CropTransform;
  onTransformChange: (next: CropTransform) => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

const CropCanvas: React.FC<Props> = ({
  children,
  active,
  aspect,
  cardWidth,
  cardHeight,
  transform,
  onTransformChange,
}) => {
  const scale = useSharedValue(transform.scale);
  const offsetX = useSharedValue(transform.offsetX);
  const offsetY = useSharedValue(transform.offsetY);
  const startScale = useSharedValue(transform.scale);
  const startOffsetX = useSharedValue(transform.offsetX);
  const startOffsetY = useSharedValue(transform.offsetY);

  React.useEffect(() => {
    scale.value = transform.scale;
    offsetX.value = transform.offsetX;
    offsetY.value = transform.offsetY;
  }, [transform, scale, offsetX, offsetY]);

  const pinch = Gesture.Pinch()
    .enabled(active)
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate(event => {
      const next = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, startScale.value * event.scale),
      );
      scale.value = next;
    })
    .onEnd(() => {
      onTransformChange({
        scale: scale.value,
        offsetX: offsetX.value,
        offsetY: offsetY.value,
      });
    });

  const pan = Gesture.Pan()
    .enabled(active)
    .onStart(() => {
      startOffsetX.value = offsetX.value;
      startOffsetY.value = offsetY.value;
    })
    .onUpdate(event => {
      offsetX.value = startOffsetX.value + event.translationX;
      offsetY.value = startOffsetY.value + event.translationY;
    })
    .onEnd(() => {
      onTransformChange({
        scale: scale.value,
        offsetX: offsetX.value,
        offsetY: offsetY.value,
      });
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const mediaStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: offsetX.value},
      {translateY: offsetY.value},
      {scale: scale.value},
    ],
  }));

  const cropFrame = getCropFrameSize(aspect, cardWidth, cardHeight);
  const cropLeft = (cardWidth - cropFrame.width) / 2;
  const cropTop = (cardHeight - cropFrame.height) / 2;

  return (
    <View style={[styles.previewInner, {width: cardWidth, height: cardHeight}]}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.mediaFill, mediaStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>

      {active && aspect !== 'original' ? (
        <View
          pointerEvents="none"
          style={[
            styles.cropFrame,
            {
              left: cropLeft,
              top: cropTop,
              width: cropFrame.width,
              height: cropFrame.height,
            },
          ]}
        />
      ) : null}
    </View>
  );
};

export default CropCanvas;
