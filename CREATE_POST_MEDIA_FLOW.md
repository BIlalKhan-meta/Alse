# Create Post Media Editing Flow

## Overview

Picked images and videos from **Create Post** and **Edit Post** always pass through the **MediaEditor** screen before being added to the post media list. This matches the design reference at `screenshots/media-editor-reference.png`.

## UI reference

| Element | Implementation |
|---------|----------------|
| Background | Light gray/white (`#F5F5F5`) |
| Header | **Editor** title (left), **Done** (right, teal) |
| Preview | White rounded card with shadow |
| Text overlay | Semi-transparent white box, black text, draggable |
| Toolbar | **Crop** and **Text** only |

## Flow

```
Pick media (camera/gallery)
  → MediaEditor (crop/text preview)
    → Image: export in-app (image-editor + view-shot)
    → Video: `react-native-video-trim` `showEditor` on Done (trim, crop, rotate)
  → CreatePost / CreatePostEdit media list
  → FormData upload (fetch, not axios)
```

## Rules (do not break)

1. **Never skip MediaEditor** after a new pick from CreatePost or CreatePostEdit.
2. **Max 10 images OR 1 video** — never mix both in one post.
3. **Multi-image picks** are edited sequentially (queue in `MediaEditor` route params).
4. **Video** replaces the entire media list; **images** append via `mergeMediaList`.
5. **Video export** must use `openVideoEditorForPost` (`react-native-video-trim`) — use `exportedUri` from `onFinishTrimming` for upload.
6. **FormData uploads** use native `fetch` per `.cursor/rules/formdata-upload-network-error.mdc`.
7. **After editing**, `MediaEditor` calls `navigation.navigate('CreatePost', { editedMediaBatch })` only — never `goBack()` after that (an extra `goBack` pops past CreatePost to Home).

## Key files

| File | Role |
|------|------|
| `src/screens/MediaEditor/` | Editor UI (screenshot layout) |
| `src/hooks/useMediaEditorFlow.ts` | Navigate to editor after pick |
| `src/utils/mediaEditor.ts` | Image crop/export + video editor wrapper |
| `src/types/mediaEditor.ts` | Route params and shared types |
| `src/screens/CreatePost/index.tsx` | Starts editor flow; receives `editedMediaBatch` |
| `src/screens/CreatePostEdit/index.tsx` | Same for edit flow |
| `App.tsx` | `GestureHandlerRootView` + `VideoEditorHost` |

## Native setup

- `App.tsx`: wrap app in `GestureHandlerRootView`
- iOS: `cd ios && LANG=en_US.UTF-8 pod install`
- Android: `READ_MEDIA_VIDEO` in `AndroidManifest.xml`
- Video: `react-native-video-trim` (works with old architecture; zluck was removed — requires New Architecture)

## Video text overlay note

Text positioned in MediaEditor is composited for **images** via view-shot. For **video**, text is shown on the in-app preview; trim/crop export uses `react-native-video-trim` (no burned-in text track). Revisit with a New-Architecture video SDK if burned-in video text is required.

## Manual test checklist

- [ ] Single image: crop 1:1 + text → Done → preview → post
- [ ] Multi-image (3): editor runs 3 times → all thumbnails appear
- [ ] Camera photo → editor → appends to existing images
- [ ] Video: preview in editor → Done → zluck trim/crop/text → upload
- [ ] Cancel editor (back) leaves media list unchanged
- [ ] Edit post: new images append; existing server media untouched
- [ ] Guards: cannot mix video + images
