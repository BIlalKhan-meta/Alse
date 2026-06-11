import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {CropAspect} from '../../../types/mediaEditor';
import {
  CropTransform,
  getContainBaseSize,
  getCropFrameSize,
  getImageDimensions,
} from '../../../utils/mediaEditor';
import styles from '../styles';

type Props = {
  imageUri: string;
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
  imageUri,
  active,
  aspect,
  cardWidth,
  cardHeight,
  transform,
  onTransformChange,
}) => {
  const [baseSize, setBaseSize] = useState({width: cardWidth, height: cardHeight});

  const scale = useSharedValue(transform.scale);
  const offsetX = useSharedValue(transform.offsetX);
  const offsetY = useSharedValue(transform.offsetY);
  const startScale = useSharedValue(transform.scale);
  const startOffsetX = useSharedValue(transform.offsetX);
  const startOffsetY = useSharedValue(transform.offsetY);

  useEffect(() => {
    let cancelled = false;
    getImageDimensions(imageUri)
      .then(size => {
        if (!cancelled) {
          setBaseSize(getContainBaseSize(size, cardWidth, cardHeight));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBaseSize({width: cardWidth, height: cardHeight});
        }
      });
    return () => {
      cancelled = true;
    };
  }, [imageUri, cardWidth, cardHeight]);

  useEffect(() => {
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
      scale.value = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, startScale.value * event.scale),
      );
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
    width: baseSize.width,
    height: baseSize.height,
    transform: [
      {translateX: offsetX.value},
      {translateY: offsetY.value},
      {scale: scale.value},
    ],
  }));

  const cropFrame = getCropFrameSize(aspect, cardWidth, cardHeight);
  const cropLeft = (cardWidth - cropFrame.width) / 2;
  const cropTop = (cardHeight - cropFrame.height) / 2;

  const dimTopHeight = cropTop;
  const dimBottomTop = cropTop + cropFrame.height;
  const dimBottomHeight = cardHeight - dimBottomTop;
  const dimLeftWidth = cropLeft;
  const dimRightLeft = cropLeft + cropFrame.width;
  const dimRightWidth = cardWidth - dimRightLeft;

  return (
    <View style={[styles.previewInner, {width: cardWidth, height: cardHeight}]}>
      <View style={styles.imageStage}>
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.imageTransformWrap, mediaStyle]}>
            <Image
              source={{uri: imageUri}}
              style={styles.cropImage}
              resizeMode="contain"
            />
          </Animated.View>
        </GestureDetector>
      </View>

      {active || aspect !== 'original' || transform.scale !== 1 ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {dimTopHeight > 0 ? (
            <View style={[styles.cropDimPanel, {top: 0, height: dimTopHeight}]} />
          ) : null}
          {dimBottomHeight > 0 ? (
            <View
              style={[
                styles.cropDimPanel,
                {top: dimBottomTop, height: dimBottomHeight},
              ]}
            />
          ) : null}
          {dimLeftWidth > 0 ? (
            <View
              style={[
                styles.cropDimPanel,
                {top: cropTop, left: 0, width: dimLeftWidth, height: cropFrame.height},
              ]}
            />
          ) : null}
          {dimRightWidth > 0 ? (
            <View
              style={[
                styles.cropDimPanel,
                {
                  top: cropTop,
                  left: dimRightLeft,
                  width: dimRightWidth,
                  height: cropFrame.height,
                },
              ]}
            />
          ) : null}

          <View
            style={[
              styles.cropFrame,
              {
                left: cropLeft,
                top: cropTop,
                width: cropFrame.width,
                height: cropFrame.height,
              },
            ]}>
            <View style={[styles.cropCorner, styles.cropCornerTL]} />
            <View style={[styles.cropCorner, styles.cropCornerTR]} />
            <View style={[styles.cropCorner, styles.cropCornerBL]} />
            <View style={[styles.cropCorner, styles.cropCornerBR]} />
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default CropCanvas;
