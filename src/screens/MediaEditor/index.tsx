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
  EditorSnapshot,
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

const snapshotsEqual = (a: EditorSnapshot, b: EditorSnapshot) =>
  a.workingUri === b.workingUri &&
  a.activeTool === b.activeTool &&
  JSON.stringify(a.textOverlay) === JSON.stringify(b.textOverlay);

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
    sourceUri: paramSourceUri,
    reEditIndex,
  } = params;

  const previewRef = useRef<View>(null);
  const historyRef = useRef<EditorSnapshot[]>([]);
  const historyIndexRef = useRef(0);
  const [cardWidth, setCardWidth] = useState(320);
  const [cardHeight, setCardHeight] = useState(400);
  const [activeTool, setActiveTool] = useState<EditorTool>('none');
  const [textOverlay, setTextOverlay] = useState<TextOverlayState | null>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [captureOverlay, setCaptureOverlay] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

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

  const sourceUri = paramSourceUri ?? currentItem.uri;

  const [workingUri, setWorkingUri] = useState(
    paramWorkingUri ?? croppedUri ?? currentItem.uri,
  );

  const applySnapshot = useCallback((snapshot: EditorSnapshot) => {
    setWorkingUri(snapshot.workingUri);
    setTextOverlay(snapshot.textOverlay);
    setActiveTool(snapshot.activeTool);
  }, []);

  const pushSnapshot = useCallback(
    (snapshot: EditorSnapshot) => {
      const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
      const last = trimmed[trimmed.length - 1];
      if (last && snapshotsEqual(last, snapshot)) {
        applySnapshot(snapshot);
        return;
      }

      const nextHistory = [...trimmed, snapshot];
      historyRef.current = nextHistory;
      historyIndexRef.current = nextHistory.length - 1;
      setCanUndo(historyIndexRef.current > 0);
      applySnapshot(snapshot);
    },
    [applySnapshot],
  );

  useEffect(() => {
    const initialWorking = paramWorkingUri ?? currentItem.uri;
    const initial: EditorSnapshot = {
      workingUri: initialWorking,
      textOverlay: null,
      activeTool: 'none',
    };
    historyRef.current = [initial];
    historyIndexRef.current = 0;
    setCanUndo(false);
    applySnapshot(initial);
  }, [currentItem.uri, paramWorkingUri, queueIndex, applySnapshot]);

  useFocusEffect(
    useCallback(() => {
      if (croppedUri) {
        pushSnapshot({
          workingUri: croppedUri,
          textOverlay,
          activeTool,
        });
        navigation.setParams({croppedUri: undefined, workingUri: croppedUri});
      }
    }, [activeTool, croppedUri, navigation, pushSnapshot, textOverlay]),
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
        params: {
          editedMediaBatch: batch,
          ...(reEditIndex !== undefined ? {reEditIndex} : {}),
        },
        merge: true,
      });
    },
    [navigation, origin, reEditIndex],
  );

  const advanceQueue = useCallback(
    (edited: EditedMedia) => {
      const editedWithSource = {
        ...edited,
        sourceUri: edited.sourceUri ?? sourceUri,
      };
      const nextCompleted = [...completedMedia, editedWithSource];
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
          sourceUri: nextItem.uri,
          reEditIndex: undefined,
        });
        return;
      }

      finishWithBatch(nextCompleted);
    },
    [completedMedia, finishWithBatch, navigation, params, queue, queueIndex, sourceUri],
  );

  const handleUndo = () => {
    if (historyIndexRef.current <= 0) {
      return;
    }
    historyIndexRef.current -= 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    setCanUndo(historyIndexRef.current > 0);
    if (snapshot) {
      applySnapshot(snapshot);
    }
  };

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
        pushSnapshot({
          workingUri: croppedUri,
          textOverlay,
          activeTool,
        });
      }
    } catch (error: any) {
      Toast.error(error?.message ?? t('imageEditorFailed'));
    } finally {
      setIsCropping(false);
    }
  };

  const handleSelectText = () => {
    if (activeTool === 'text') {
      pushSnapshot({
        workingUri,
        textOverlay,
        activeTool: 'none',
      });
      return;
    }

    if (!textOverlay) {
      const overlay = createDefaultTextOverlay(cardWidth, cardHeight);
      pushSnapshot({
        workingUri,
        textOverlay: overlay,
        activeTool: 'text',
      });
      return;
    }

    pushSnapshot({
      workingUri,
      textOverlay,
      activeTool: 'text',
    });
  };

  const handleTextOverlayChange = (next: TextOverlayState) => {
    setTextOverlay(next);
  };

  const handleTextDragEnd = (next: TextOverlayState) => {
    pushSnapshot({
      workingUri,
      textOverlay: next,
      activeTool,
    });
  };

  const handleTextStyleChange = (next: TextOverlayState) => {
    setTextOverlay(next);
    pushSnapshot({
      workingUri,
      textOverlay: next,
      activeTool,
    });
  };

  const handleDone = async () => {
    if (!currentItem?.uri || isExporting) {
      return;
    }

    try {
      if (currentItem.kind === 'video') {
        setIsExporting(true);
        const result = await openVideoEditorForPost(workingUri || currentItem.uri);
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
          sourceUri,
        });
        return;
      }

      const hasText = !!textOverlay?.text?.trim();

      if (hasText) {
        setCaptureOverlay(true);
        await new Promise<void>(resolve => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        });
      } else {
        setIsExporting(true);
      }

      const exported = await exportImageMedia({
        uri: workingUri,
        hasTextOverlay: hasText,
        previewRef,
      });

      setCaptureOverlay(false);
      setIsExporting(true);

      advanceQueue({
        uri: exported.uri,
        name: currentItem.name ?? `image_${Date.now()}.jpg`,
        type: currentItem.type ?? 'image/jpeg',
        kind: 'image',
        width: exported.width,
        height: exported.height,
        sourceUri,
      });
    } catch (error: any) {
      Toast.error(error?.message ?? t('imageEditorFailed'));
    } finally {
      setCaptureOverlay(false);
      setIsExporting(false);
    }
  };

  const renderMedia = () => {
    if (currentItem.kind === 'video') {
      return (
        <>
          <Video
            source={{uri: workingUri || currentItem.uri}}
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
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.undoButton, !canUndo && styles.undoButtonDisabled]}
            onPress={handleUndo}
            disabled={!canUndo || isExporting}>
            <Text
              style={[styles.undoText, !canUndo && styles.undoTextDisabled]}>
              {t('undo')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('editor')}</Text>
        </View>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          disabled={isExporting}>
          <Text style={styles.doneText}>{t('done')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.previewSection}>
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
            draggable={isTextActive && !!textOverlay}
            exportMode={captureOverlay}
            placeholder={t('editorTextPlaceholder')}
            onChange={handleTextOverlayChange}
            onDragEnd={handleTextDragEnd}
          />
        </View>

        {queueLabel ? (
          <Text style={styles.queueIndicator}>{queueLabel}</Text>
        ) : null}

        {activeTool === 'crop' && currentItem.kind === 'video' ? (
          <Text style={styles.cropHint}>{t('videoCropOnDone')}</Text>
        ) : null}
      </View>

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}>
        {isTextActive && textOverlay ? (
          <TextStylePanel
            overlay={textOverlay}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            onChange={handleTextStyleChange}
          />
        ) : null}
      </KeyboardAwareScrollView>

      <View style={styles.toolbarDock}>
        <EditorToolbar
          activeTool={activeTool}
          onSelectCrop={handleSelectCrop}
          onSelectText={handleSelectText}
        />
      </View>

      {(isExporting || isCropping) && !captureOverlay ? (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#20B2AA" />
        </View>
      ) : null}
    </View>
  );
};

export default MediaEditor;
