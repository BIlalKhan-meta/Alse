import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Video from 'react-native-video';
import {
  CropAspect,
  EditedMedia,
  EditorTool,
  MediaEditorRouteParams,
  TextOverlayState,
} from '../../types/mediaEditor';
import {
  CropTransform,
  exportImageMedia,
  openVideoEditorForPost,
} from '../../utils/mediaEditor';
import {Toast} from '../../utils/helpers';
import CropCanvas from './components/CropCanvas';
import EditorToolbar from './components/EditorToolbar';
import TextOverlayLayer from './components/TextOverlayLayer';
import styles from './styles';

const ASPECT_OPTIONS: CropAspect[] = ['original', '1:1', '4:5', '16:9'];

const MediaEditor: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {t} = useTranslation();
  const params = (route.params ?? {}) as MediaEditorRouteParams;

  const {
    uri,
    name,
    type,
    kind,
    queue = [],
    queueIndex = 0,
    origin = 'create',
    completedMedia = [],
  } = params;

  const previewRef = useRef<View>(null);
  const [cardWidth, setCardWidth] = useState(320);
  const [cardHeight, setCardHeight] = useState(400);
  const [activeTool, setActiveTool] = useState<EditorTool>('none');
  const [cropAspect, setCropAspect] = useState<CropAspect>('original');
  const [cropTransform, setCropTransform] = useState<CropTransform>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [textOverlay, setTextOverlay] = useState<TextOverlayState | null>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentItem = useMemo(
    () =>
      queue[queueIndex] ?? {
        uri,
        name,
        type,
        kind,
      },
    [queue, queueIndex, uri, name, type, kind],
  );

  const queueLabel =
    queue.length > 1 ? `${queueIndex + 1} / ${queue.length}` : null;

  const onCardLayout = (event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCardWidth(width);
      setCardHeight(height);
    }
  };

  const finishWithBatch = useCallback(
    (batch: EditedMedia[]) => {
      const targetScreen = origin === 'edit' ? 'CreatePostEdit' : 'CreatePost';
      // Navigate back to the post screen with results. Do not call goBack() after
      // this — navigate already pops MediaEditor off the stack; an extra goBack
      // would pop CreatePost/CreatePostEdit and land on Home.
      navigation.navigate({
        name: targetScreen,
        params: {editedMediaBatch: batch},
        merge: true,
      });
    },
    [navigation, origin],
  );

  const advanceQueue = useCallback(
    (edited: EditedMedia) => {
      const nextCompleted = [...completedMedia, edited];
      const nextIndex = queueIndex + 1;

      if (nextIndex < queue.length) {
        const nextItem = queue[nextIndex];
        navigation.replace('MediaEditor', {
          ...params,
          uri: nextItem.uri,
          name: nextItem.name,
          type: nextItem.type,
          kind: nextItem.kind,
          queueIndex: nextIndex,
          completedMedia: nextCompleted,
        });
        return;
      }

      finishWithBatch(nextCompleted);
    },
    [completedMedia, finishWithBatch, navigation, params, queue, queueIndex],
  );

  const handleSelectCrop = () => {
    setActiveTool(prev => (prev === 'crop' ? 'none' : 'crop'));
  };

  const handleSelectText = () => {
    setActiveTool(prev => {
      const next = prev === 'text' ? 'none' : 'text';
      if (next === 'text' && !textOverlay) {
        setTextOverlay({
          text: '',
          x: cardWidth * 0.05,
          y: cardHeight * 0.62,
          width: cardWidth * 0.9,
        });
      }
      return next;
    });
  };

  const handleDone = async () => {
    if (!currentItem?.uri || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      if (currentItem.kind === 'video') {
        const result = await openVideoEditorForPost(currentItem.uri);
        if (!result.success || !result.exportedUri) {
          if (result.error && result.error !== 'User cancelled') {
            Toast.error(result.error ?? t('videoEditorFailed'));
          }
          return;
        }

        advanceQueue({
          uri: result.exportedUri,
          name: currentItem.name,
          type: currentItem.type ?? 'video/mp4',
          kind: 'video',
        });
        return;
      }

      const exported = await exportImageMedia({
        uri: currentItem.uri,
        aspect: cropAspect,
        transform: cropTransform,
        hasTextOverlay: !!textOverlay?.text?.trim(),
        previewRef,
        cardWidth,
        cardHeight,
      });

      advanceQueue({
        uri: exported.uri,
        name: currentItem.name ?? `image_${Date.now()}.jpg`,
        type: currentItem.type ?? 'image/jpeg',
        kind: 'image',
        width: exported.width,
        height: exported.height,
      });
    } catch (error: any) {
      Toast.error(error?.message ?? t('imageEditorFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  const aspectLabel = (aspect: CropAspect) => {
    switch (aspect) {
      case 'original':
        return t('aspectOriginal');
      case '1:1':
        return '1:1';
      case '4:5':
        return '4:5';
      case '16:9':
        return '16:9';
      default:
        return aspect;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.gradientOverlay} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('editor')}</Text>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          disabled={isExporting}>
          <Text style={styles.doneText}>{t('done')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View
          ref={previewRef}
          collapsable={false}
          style={styles.previewCard}
          onLayout={onCardLayout}>
          <CropCanvas
            active={activeTool === 'crop' && currentItem.kind === 'image'}
            aspect={cropAspect}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            transform={cropTransform}
            onTransformChange={setCropTransform}>
            {currentItem.kind === 'video' ? (
              <>
                <Video
                  source={{uri: currentItem.uri}}
                  style={styles.mediaFill}
                  resizeMode="cover"
                  repeat
                  paused={videoPaused}
                />
                <TouchableOpacity
                  style={styles.videoControls}
                  onPress={() => setVideoPaused(prev => !prev)}>
                  <Text style={styles.videoControlText}>
                    {videoPaused ? t('play') : t('pause')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Image
                source={{uri: currentItem.uri}}
                style={styles.mediaFill}
                resizeMode="cover"
              />
            )}
          </CropCanvas>

          <TextOverlayLayer
            overlay={textOverlay}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            editable={activeTool === 'text'}
            placeholder={t('editorTextPlaceholder')}
            onChange={setTextOverlay}
          />
        </View>

        {queueLabel ? (
          <Text style={styles.queueIndicator}>{queueLabel}</Text>
        ) : null}

        {activeTool === 'crop' && currentItem.kind === 'image' ? (
          <View style={styles.aspectRow}>
            {ASPECT_OPTIONS.map(aspect => (
              <TouchableOpacity
                key={aspect}
                style={[
                  styles.aspectChip,
                  cropAspect === aspect && styles.aspectChipActive,
                ]}
                onPress={() => setCropAspect(aspect)}>
                <Text
                  style={[
                    styles.aspectChipText,
                    cropAspect === aspect && styles.aspectChipTextActive,
                  ]}>
                  {aspectLabel(aspect)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      <EditorToolbar
        activeTool={activeTool}
        onSelectCrop={handleSelectCrop}
        onSelectText={handleSelectText}
      />

      {isExporting ? (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#20B2AA" />
        </View>
      ) : null}
    </View>
  );
};

export default MediaEditor;
