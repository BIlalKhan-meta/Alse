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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useTranslation} from 'react-i18next';
import Video from 'react-native-video';
import {
  createDefaultTextOverlay,
  EditedMedia,
  EditorTool,
  MediaEditorRouteParams,
  TextOverlayState,
} from '../../types/mediaEditor';
import {
  exportImageMedia,
  openNativeImageCropper,
  openVideoEditorForPost,
} from '../../utils/mediaEditor';
import {Toast} from '../../utils/helpers';
import EditorToolbar from './components/EditorToolbar';
import TextOverlayLayer from './components/TextOverlayLayer';
import TextStylePanel from './components/TextStylePanel';
import styles from './styles';

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
    workingUri: paramWorkingUri,
    croppedUri,
  } = params;

  const previewRef = useRef<View>(null);
  const [cardWidth, setCardWidth] = useState(320);
  const [cardHeight, setCardHeight] = useState(400);
  const [activeTool, setActiveTool] = useState<EditorTool>('none');
  const [textOverlay, setTextOverlay] = useState<TextOverlayState | null>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

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

  const [workingUri, setWorkingUri] = useState(
    paramWorkingUri ?? croppedUri ?? currentItem.uri,
  );

  useEffect(() => {
    setWorkingUri(paramWorkingUri ?? currentItem.uri);
    setTextOverlay(null);
    setActiveTool('none');
  }, [currentItem.uri, paramWorkingUri, queueIndex]);

  useFocusEffect(
    useCallback(() => {
      if (croppedUri) {
        setWorkingUri(croppedUri);
        navigation.setParams({croppedUri: undefined, workingUri: croppedUri});
      }
    }, [croppedUri, navigation]),
  );

  const queueLabel =
    queue.length > 1 ? `${queueIndex + 1} / ${queue.length}` : null;

  const isTextActive = activeTool === 'text';

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
          workingUri: undefined,
          croppedUri: undefined,
        });
        return;
      }

      finishWithBatch(nextCompleted);
    },
    [completedMedia, finishWithBatch, navigation, params, queue, queueIndex],
  );

  const handleSelectCrop = async () => {
    if (currentItem.kind === 'video') {
      Toast.show(t('videoCropOnDone'));
      setActiveTool(prev => (prev === 'crop' ? 'none' : 'crop'));
      return;
    }

    if (isCropping) {
      return;
    }

    setIsCropping(true);
    try {
      const croppedUri = await openNativeImageCropper(workingUri);
      if (croppedUri) {
        setWorkingUri(croppedUri);
      }
    } catch (error: any) {
      Toast.error(error?.message ?? t('imageEditorFailed'));
    } finally {
      setIsCropping(false);
    }
  };

  const handleSelectText = () => {
    setActiveTool(prev => {
      const next = prev === 'text' ? 'none' : 'text';
      if (next === 'text' && !textOverlay) {
        setTextOverlay(createDefaultTextOverlay(cardWidth, cardHeight));
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

      const hasText = !!textOverlay?.text?.trim();

      const exported = await exportImageMedia({
        uri: workingUri,
        hasTextOverlay: hasText,
        previewRef,
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

  const renderMedia = () => {
    if (currentItem.kind === 'video') {
      return (
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
      );
    }

    return (
      <Image
        source={{uri: workingUri}}
        style={styles.mediaFill}
        resizeMode="cover"
      />
    );
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

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isTextActive}
        showsVerticalScrollIndicator={false}>
        <View
          ref={previewRef}
          collapsable={false}
          style={styles.previewCard}
          onLayout={onCardLayout}>
          <View
            style={[styles.previewInner, {width: cardWidth, height: cardHeight}]}>
            {renderMedia()}
          </View>

          <TextOverlayLayer
            overlay={textOverlay}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            editable={isTextActive}
            draggable={!!textOverlay}
            placeholder={t('editorTextPlaceholder')}
            onChange={setTextOverlay}
          />
        </View>

        {queueLabel ? (
          <Text style={styles.queueIndicator}>{queueLabel}</Text>
        ) : null}

        {activeTool === 'crop' && currentItem.kind === 'video' ? (
          <Text style={styles.cropHint}>{t('videoCropOnDone')}</Text>
        ) : null}

        {isTextActive && textOverlay ? (
          <TextStylePanel overlay={textOverlay} onChange={setTextOverlay} />
        ) : null}
      </KeyboardAwareScrollView>

      <View style={styles.toolbarDock}>
        <EditorToolbar
          activeTool={activeTool}
          onSelectCrop={handleSelectCrop}
          onSelectText={handleSelectText}
        />
      </View>

      {isExporting || isCropping ? (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#20B2AA" />
        </View>
      ) : null}
    </View>
  );
};

export default MediaEditor;
