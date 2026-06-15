import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Gesture, GestureDetector, ScrollView} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {useTranslation} from 'react-i18next';
import Video from 'react-native-video';
import useMusicPicker from '../../hooks/useMusicPicker';
import {
  MusicPickerRouteParams,
  SelectedMusic,
} from '../../types/backgroundMusic';
import {
  clampMusicClip,
  formatMusicLabel,
} from '../../utils/backgroundMusic';
import {Toast} from '../../utils/helpers';
import styles from './styles';

const THUMB_HALF = 14;

type MusicSliderProps = {
  label: string;
  valueLabel: string;
  minimumValue: number;
  maximumValue: number;
  value: number;
  onValueChange: (value: number) => void;
};

const MusicSlider: React.FC<MusicSliderProps> = ({
  label,
  valueLabel,
  minimumValue,
  maximumValue,
  value,
  onValueChange,
}) => {
  const trackWidth = useSharedValue(1);
  const thumbX = useSharedValue(0);
  const dragStartX = useSharedValue(0);
  const isDragging = useRef(false);

  const valueToThumbX = useCallback(
    (nextValue: number, width: number) => {
      if (width <= 0 || maximumValue <= minimumValue) {
        return 0;
      }
      const ratio = Math.min(
        1,
        Math.max(0, (nextValue - minimumValue) / (maximumValue - minimumValue)),
      );
      return ratio * width;
    },
    [maximumValue, minimumValue],
  );

  const thumbXToValue = useCallback(
    (x: number, width: number) => {
      if (width <= 0 || maximumValue <= minimumValue) {
        return minimumValue;
      }
      const ratio = Math.min(1, Math.max(0, x / width));
      return minimumValue + ratio * (maximumValue - minimumValue);
    },
    [maximumValue, minimumValue],
  );

  const emitValue = useCallback(
    (x: number) => {
      onValueChange(thumbXToValue(x, trackWidth.value));
    },
    [onValueChange, thumbXToValue, trackWidth],
  );

  useEffect(() => {
    if (!isDragging.current) {
      thumbX.value = valueToThumbX(value, trackWidth.value);
    }
  }, [thumbX, trackWidth, value, valueToThumbX]);

  const handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      trackWidth.value = width;
      thumbX.value = valueToThumbX(value, width);
    },
    [thumbX, trackWidth, value, valueToThumbX],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-6, 6])
        .failOffsetY([-12, 12])
        .onBegin(event => {
          isDragging.current = true;
          const width = trackWidth.value;
          const nextX = Math.min(width, Math.max(0, event.x));
          dragStartX.value = nextX;
          thumbX.value = nextX;
          runOnJS(emitValue)(nextX);
        })
        .onUpdate(event => {
          const width = trackWidth.value;
          const nextX = Math.min(
            width,
            Math.max(0, dragStartX.value + event.translationX),
          );
          thumbX.value = nextX;
        })
        .onEnd(event => {
          const width = trackWidth.value;
          const nextX = Math.min(
            width,
            Math.max(0, dragStartX.value + event.translationX),
          );
          thumbX.value = nextX;
          runOnJS(emitValue)(nextX);
        })
        .onFinalize(() => {
          isDragging.current = false;
        }),
    [dragStartX, emitValue, thumbX, trackWidth],
  );

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{translateX: thumbX.value - THUMB_HALF}],
  }));

  return (
    <View>
      <Text style={styles.controlLabel}>{label}</Text>
      <Text style={styles.controlValue}>{valueLabel}</Text>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={styles.sliderTrack}
          onLayout={handleTrackLayout}>
          <View style={styles.sliderRail} />
          <Animated.View style={[styles.sliderFill, fillStyle]} />
          <Animated.View style={[styles.sliderThumb, thumbStyle]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const formatMs = (ms: number) => {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const MusicPicker: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {t} = useTranslation();
  const params = (route.params ?? {}) as MusicPickerRouteParams;
  const {imageUri} = params;

  const videoRef = useRef<any>(null);
  const {isPicking, pickAudioFile} = useMusicPicker();
  const [music, setMusic] = useState<SelectedMusic | null>(
    params.existingMusic ?? null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(!params.existingMusic);
  const hasBootstrappedRef = useRef(!!params.existingMusic);

  const clip = useMemo(() => {
    if (!music) {
      return null;
    }
    return clampMusicClip(
      music.durationMs,
      music.clipStartMs,
      music.clipDurationMs,
    );
  }, [music]);

  const updateMusicClip = useCallback(
    (nextStartMs: number, nextDurationMs: number) => {
      setMusic(prev => {
        if (!prev) {
          return prev;
        }
        const bounded = clampMusicClip(
          prev.durationMs,
          nextStartMs,
          nextDurationMs,
        );
        return {
          ...prev,
          clipStartMs: bounded.clipStartMs,
          clipDurationMs: bounded.clipDurationMs,
        };
      });
      setIsPlaying(false);
    },
    [],
  );

  const handlePickAudio = useCallback(async () => {
    try {
      const picked = await pickAudioFile();
      if (picked) {
        setMusic(picked);
        setIsPlaying(false);
      }
    } catch (error: any) {
      const message =
        /permission/i.test(error?.message ?? '')
          ? t('musicPermissionDenied')
          : error?.message || t('musicPickFailed');
      Toast.error(message);
    }
  }, [pickAudioFile, t]);

  useFocusEffect(
    useCallback(() => {
      if (params.existingMusic || hasBootstrappedRef.current) {
        setIsBootstrapping(false);
        return;
      }

      hasBootstrappedRef.current = true;
      let cancelled = false;
      const bootstrap = async () => {
        try {
          await handlePickAudio();
        } finally {
          if (!cancelled) {
            setIsBootstrapping(false);
          }
        }
      };

      bootstrap();
      return () => {
        cancelled = true;
      };
    }, [handlePickAudio, params.existingMusic]),
  );

  const handleDone = () => {
    if (!music || !clip) {
      Toast.error(t('musicPickFailed'));
      return;
    }

    const selectedMusic: SelectedMusic = {
      ...music,
      clipStartMs: clip.clipStartMs,
      clipDurationMs: clip.clipDurationMs,
    };

    navigation.navigate({
      name: 'CreatePost',
      params: {selectedMusic},
      merge: true,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const maxStartMs = Math.max(
    0,
    (music?.durationMs ?? 0) - (clip?.clipDurationMs ?? 1000),
  );
  const maxDurationMs = Math.min(
    music?.durationMs ?? 0,
    30000,
    Math.max(1000, (music?.durationMs ?? 0) - (clip?.clipStartMs ?? 0)),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backText}>{t('cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('musicPickerTitle')}</Text>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          disabled={!music}>
          <Text
            style={[styles.doneText, !music && styles.doneTextDisabled]}>
            {t('done')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled>
        <View style={styles.previewSection}>
          <View style={styles.previewCard}>
            <Image
              source={{uri: imageUri}}
              style={styles.previewImage}
              resizeMode="cover"
            />
            {music ? (
              <Video
                ref={videoRef}
                source={{uri: music.uri}}
                style={styles.hiddenAudio}
                paused={!isPlaying}
                repeat={false}
                playInBackground={false}
                ignoreSilentSwitch="ignore"
                onLoad={() => {
                  videoRef.current?.seek(clip?.clipStartMs ? clip.clipStartMs / 1000 : 0);
                }}
                onProgress={data => {
                  if (!clip) {
                    return;
                  }
                  const endSec = (clip.clipStartMs + clip.clipDurationMs) / 1000;
                  if (data.currentTime >= endSec) {
                    videoRef.current?.seek(clip.clipStartMs / 1000);
                  }
                }}
                onEnd={() => {
                  if (clip) {
                    videoRef.current?.seek(clip.clipStartMs / 1000);
                  }
                  setIsPlaying(false);
                }}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.pickButton}
            onPress={handlePickAudio}
            disabled={isPicking}>
            <Text style={styles.pickButtonText}>
              {music ? t('changeMusic') : t('selectMusic')}
            </Text>
          </TouchableOpacity>

          {music && clip ? (
            <View style={styles.trackCard}>
              <Text style={styles.trackName}>
                {formatMusicLabel(music, t('unknownTrack'))}
              </Text>
              <Text style={styles.trackMeta}>
                {t('selectMusicClip')} · {formatMs(music.durationMs)}
              </Text>

              <MusicSlider
                label={t('musicClipStart')}
                valueLabel={formatMs(clip.clipStartMs)}
                minimumValue={0}
                maximumValue={maxStartMs}
                value={clip.clipStartMs}
                onValueChange={next =>
                  updateMusicClip(next, clip.clipDurationMs)
                }
              />

              <MusicSlider
                label={t('musicClipLength')}
                valueLabel={formatMs(clip.clipDurationMs)}
                minimumValue={1000}
                maximumValue={Math.max(1000, maxDurationMs)}
                value={clip.clipDurationMs}
                onValueChange={next =>
                  updateMusicClip(clip.clipStartMs, next)
                }
              />

              <View style={styles.playRow}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => {
                    if (!isPlaying && clip) {
                      videoRef.current?.seek(clip.clipStartMs / 1000);
                    }
                    setIsPlaying(prev => !prev);
                  }}>
                  <Text style={styles.playButtonText}>
                    {isPlaying ? t('pauseMusicPreview') : t('playMusicPreview')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {isBootstrapping || isPicking ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#20B2AA" />
        </View>
      ) : null}
    </View>
  );
};

export default MusicPicker;
