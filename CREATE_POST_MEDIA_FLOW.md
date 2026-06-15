# Create Post Media Flow — Full Reference

**Read this before changing pick, edit, crop, text overlay, scroll, or upload behavior.**

Design reference: `screenshots/media-editor-reference.png`

---

## End-to-end flow

```
Home / Feed
  → CreatePost or CreatePostEdit
      → useImagePicker (camera / gallery)
      → useMediaEditorFlow.startImageEditFlow | startVideoEditFlow
      → MediaEditor (crop + text on preview)
          → Image Done: exportImageMedia (view-shot if text, else original/cropped uri)
          → Video Done: openVideoEditorForPost (react-native-video-trim)
      → navigation.navigate({ editedMediaBatch }) — NEVER goBack() after this
      → CreatePost / CreatePostEdit receives batch via useFocusEffect
      → FormData upload via fetch (NOT axios)
```

---

## Hard rules (never break)

| # | Rule |
|---|------|
| 1 | **Always route new picks through MediaEditor** — never push raw picker URIs into `selectedMediaList` / `mediaList`. |
| 2 | **Max 10 images OR 1 video** per post — never mix both. |
| 3 | **Multi-image picks** edit sequentially via `queue` + `queueIndex` in MediaEditor params. |
| 4 | **Video** replaces the entire media list; **images** append via `mergeMediaList`. |
| 5 | **Video upload** uses trim export URI from `openVideoEditorForPost`, not raw picker URI. |
| 6 | **FormData uploads** use native `fetch` (see `.cursor/rules/formdata-upload-network-error.mdc`). |
| 7 | After MediaEditor finishes: `navigation.navigate({ name, params: { editedMediaBatch }, merge: true })` only — extra `goBack()` pops past CreatePost to Home. |
| 8 | **App root** must wrap in `GestureHandlerRootView` (`App.tsx`). |

---

## Key files

| File | Role |
|------|------|
| `src/screens/CreatePost/index.tsx` | New post UI; starts editor; receives `editedMediaBatch` |
| `src/screens/CreatePostEdit/index.tsx` | Edit post UI; same editor integration |
| `src/hooks/useImagePicker.ts` | Camera/gallery picker, `PickedMedia` mapping |
| `src/hooks/useMediaEditorFlow.ts` | `startImageEditFlow`, `startVideoEditFlow` navigation |
| `src/screens/MediaEditor/index.tsx` | Editor screen layout + Done handler |
| `src/screens/MediaEditor/components/` | Toolbar, text overlay, text style panel |
| `src/utils/mediaEditor.ts` | Crop (`openNativeImageCropper`), export, video trim |
| `src/types/mediaEditor.ts` | Route params, `TextOverlayState`, queue types |

---

## MediaEditor layout (critical)

The editor has **four zones**. Do not collapse preview into the scroll view.

```
┌─────────────────────────────┐
│ Header: Editor    [Done]    │  fixed
├─────────────────────────────┤
│ Preview card (image/video)  │  fixed — NOT inside ScrollView
│   + TextOverlayLayer        │  draggable pan gestures live here
├─────────────────────────────┤
│ ScrollView                  │  flex:1 — TextStylePanel only
│   (color / size / bg opts)  │
├─────────────────────────────┤
│ Toolbar: Crop | Text        │  fixed, compact
└─────────────────────────────┘
```

### Why preview must stay outside ScrollView

- Putting the preview inside `KeyboardAwareScrollView` causes the scroll view to **steal vertical pan gestures**.
- Result: scroll works but **text cannot be dragged** on the image (or vice versa).
- **Fix:** preview + overlay in `previewSection` (fixed). Only `TextStylePanel` scrolls.

### Scroll rules

| Do | Don't |
|----|-------|
| Keep `scrollEnabled` always `true` | `scrollEnabled={!isTextActive}` — blocks panel when text tool open |
| `pointerEvents: 'none'` on decorative overlays | Full-screen `absoluteFill` views without `pointerEvents: 'none'` block touch |
| `nestedScrollEnabled` on Android | `flexGrow: 1` on scroll content when it prevents overflow scroll |

### Text overlay rules

| Behavior | Implementation |
|----------|----------------|
| Placeholder | Short `"text"` via `editorTextPlaceholder` i18n key |
| Move text | Drag the **top grip handle** on the text box — works while typing |
| Type text | Tap the text area below the handle |
| Export | `exportImageMedia` + `captureRef(previewRef)` burns text into image |
| Video text | Preview only; trim export does not burn text (known limitation) |

### Undo

- Header **Undo** button steps back through editor history (crop, text, style, position).
- History is per MediaEditor session; initial snapshot = state when editor opened.
- `sourceUri` on `PickedMedia` preserves the original picker URI across re-edits.

### Re-edit from CreatePost / CreatePostEdit

- Tap an already-edited thumbnail → `startReEditFlow(media, index)`.
- Opens MediaEditor with `workingUri = media.uri` (current preview) and `sourceUri` preserved.
- On Done with `reEditIndex`, replace that slot in the media list (do not append).

### Gesture rules (`TextOverlayLayer`)

- Pan gesture on **drag handle only** (not whole box, not blocked by keyboard/focus).
- Preview card is **outside** ScrollView so handle pan and panel scroll never compete.

### Crop rules (`openNativeImageCropper`)

Picker URIs (`ph://`, `content://`, `file://`) must be resolved before native cropper:

1. Copy/download image to app cache via `resolveLocalImagePath`.
2. Pass platform-formatted path via `formatPathForCropper` (`file://` on Android, absolute path on iOS).
3. Verify file exists before `ImagePicker.openCropper`.
4. Handle `E_PICKER_CANCELLED`, `E_NO_IMAGE_DATA_FOUND`, `E_CROPPER_IMAGE_NOT_FOUND`.

Image crop opens immediately on Crop tap. Video crop opens on Done via `react-native-video-trim`.

### Toolbar sizing

Keep Crop + Text toolbar **compact** (small icons, low padding). Do not inflate bottom dock — it steals space from preview and scroll area.

---

## Integration snippets

### Start editor after pick

```typescript
// Images (single or multi)
startImageEditFlow(imagesData, remainingMediaSlots);

// Video
startVideoEditFlow({ uri, name, type, kind: 'video' });
```

### MediaEditor finish

```typescript
navigation.navigate({
  name: origin === 'edit' ? 'CreatePostEdit' : 'CreatePost',
  params: { editedMediaBatch: batch },
  merge: true,
});
// Do NOT call navigation.goBack() here
```

### Receive edited media

```typescript
useFocusEffect(
  useCallback(() => {
    const batch = route.params?.editedMediaBatch as EditedMedia[] | undefined;
    if (!batch?.length) return;

    if (batch.some(item => item.kind === 'video')) {
      setMediaList(batch); // replace
    } else {
      setMediaList(prev => mergeMediaList(prev, batch, MAX_MEDIA)); // append
    }
    navigation.setParams({ editedMediaBatch: undefined });
  }, [navigation, route.params?.editedMediaBatch]),
);
```

---

## Native / deps

- `GestureHandlerRootView` in `App.tsx`
- `react-native-image-crop-picker` — native image crop
- `react-native-video-trim` — video trim/crop on Done
- `react-native-view-shot` — composite text onto image export
- `react-native-fs` — copy picker URIs to cache before crop
- iOS: `pod install` after native dep changes
- Android: `READ_MEDIA_VIDEO` in manifest

---

## Manual test checklist

- [ ] Single image: crop → add text → drag text on image → scroll style panel → Done → post
- [ ] Text: tap to type, blur, drag to new position — both work without breaking scroll
- [ ] Multi-image (3): editor queue runs 3 times → all thumbnails on CreatePost
- [ ] Video: preview in editor → Done → trim editor → upload uses trimmed URI
- [ ] Crop button does not show "Cannot find image data" (gallery + camera + iOS ph://)
- [ ] Cancel editor (back) — media list unchanged
- [ ] Edit post: new images append; existing server media untouched
- [ ] Cannot mix video + images in one post
- [ ] No extra goBack after Done — lands on CreatePost, not Home

---

## Common regressions (avoid)

1. **Scroll fixed, drag broken** → preview was inside ScrollView; move it out.
2. **Drag fixed, scroll broken** → `scrollEnabled={false}` or overlay blocking touches.
3. **Crop error** → picker URI passed raw to cropper; use `resolveLocalImagePath`.
4. **Long placeholder** → use `editorTextPlaceholder: 'text'`.
5. **Done pops to Home** → remove extra `goBack()` after `navigate(editedMediaBatch)`.
