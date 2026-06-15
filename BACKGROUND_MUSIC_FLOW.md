# Background Music on Photo Posts — Full Reference

**Read this before changing music pick, trim, preview, mux, or upload behavior.**

Related: [CREATE_POST_MEDIA_FLOW.md](CREATE_POST_MEDIA_FLOW.md) (image pick → MediaEditor → upload)

---

## End-to-end flow

```
CreatePost (1–10 images in media list, no video)
  → Tap Add Music
  → MusicPicker screen
      → useMusicPicker.pickAudioFile (@react-native-documents/picker)
      → Trim clip (start offset + duration, max 30s)
      → Preview first image + thumbnail strip + audio (react-native-video)
      → Done: navigation.navigate({ selectedMusic }) — NEVER goBack() after this
  → CreatePost receives selectedMusic via useFocusEffect
  → handlePost:
      → composePhotoMusicSlideshow (native slideshow + audio mux)
      → buildPostVideoFile → FormData file[0] via fetch
  → Feed renders muxed post as inline video (existing PostComponent path)
```

**Feed note:** Multi-image + music posts upload as **one slideshow video**, not a swipeable image carousel.

---

## Hard rules (never break)

| # | Rule |
|---|------|
| 1 | Music is **images only** (1–10) — no video; clear music if user adds video or removes all images. |
| 2 | Music **persists** when user adds more images (still all images). |
| 3 | **At least one image required** before Add Music. |
| 4 | Max clip duration **30 seconds** (`MAX_MUSIC_CLIP_SECONDS` in `backgroundMusic.ts`). |
| 5 | Min **1 second per slide** (`MIN_SLIDE_DURATION_SEC`) — reject compose if `clipDuration / imageCount < 1s`. |
| 6 | Mux output uploads as **one video file** via `buildPostVideoFile` + existing fetch upload. |
| 7 | Never hardcode track names — use file metadata + `unknownTrack` i18n fallback. |
| 8 | Copy `content://` / `ph://` URIs to cache before native compose (`resolveLocalAudioPath`, `resolveLocalImagePath`). |
| 9 | FormData uploads use native **fetch** (see `.cursor/rules/formdata-upload-network-error.mdc`). |
| 10 | After MusicPicker finishes: `navigation.navigate({ name: 'CreatePost', params: { selectedMusic }, merge: true })` only — extra `goBack()` pops past CreatePost. |

---

## Key files

| File | Role |
|------|------|
| `src/screens/CreatePost/index.tsx` | Music state, Add Music guards, slideshow mux on post |
| `src/screens/MusicPicker/index.tsx` | Pick audio, trim clip, multi-image preview, return `selectedMusic` |
| `src/hooks/useMusicPicker.ts` | Document picker + cache copy |
| `src/utils/backgroundMusic.ts` | URI resolve, slideshow compose, label formatting |
| `src/utils/photoMusicComposer.ts` | Native audio trim + video/audio mux bridge |
| `src/types/backgroundMusic.ts` | `SelectedMusic`, route params |
| `src/utils/mediaEditor.ts` | `resolveLocalImagePath` reused for image mux input |
| `src/utils/helpers.tsx` | `buildPostVideoFile`, `prepareVideoUriForUpload` |

---

## Types

```typescript
// src/types/backgroundMusic.ts
export type SelectedMusic = {
  uri: string;
  name: string;
  mimeType: string;
  durationMs: number;
  clipStartMs: number;
  clipDurationMs: number;
};

export type MusicPickerRouteParams = {
  imageUris: string[];
  imageName?: string;
  existingMusic?: SelectedMusic;
};
```

---

## Slideshow compose reference

Function: `composePhotoMusicSlideshow` in `src/utils/backgroundMusic.ts`

1. `trimAudioClipNative()` via `PhotoMusicComposer` — trim + AAC encode
2. `convertImageToVideo()` per image (bare path, equal `slideDurationSec`)
3. `mergeVideos()` from `react-native-nitro-media-kit` — concat silent clips
4. `muxVideoWithAudioNative()` via `PhotoMusicComposer` — attach music bed

`composePhotoMusicVideo({ imageUri })` delegates to slideshow with `imageUris: [imageUri]`.

**Slide duration:** `clipDurationMs / 1000 / imageCount` (equal split).

**Tunables** (change in `backgroundMusic.ts` only):

| Constant | Default | Purpose |
|----------|---------|---------|
| `MAX_MUSIC_CLIP_SECONDS` | 30 | Max selectable clip length |
| `MIN_SLIDE_DURATION_SEC` | 1 | Min seconds per image in slideshow |

---

## Integration snippets

### Open MusicPicker from CreatePost

```typescript
navigation.navigate('MusicPicker', {
  imageUris: selectedMediaList.map(media => media.uri),
  imageName: selectedMediaList[0]?.name,
  existingMusic: selectedMusic ?? undefined,
});
```

### Post with music

```typescript
const videoUri = await composePhotoMusicSlideshow({
  imageUris: imageMediaList.map(media => media.uri),
  music: selectedMusic,
  onProgress: (current, total) => setLoadingMessage(t('composingSlide', { current, total })),
});
const file = await buildPostVideoFile(videoUri, 'post_music.mp4', 'video/mp4');
body.append('file[0]', file as any);
```

### Clear music when media changes

```typescript
useEffect(() => {
  const invalid =
    selectedMediaList.length === 0 ||
    selectedMediaList.some(media => media?.kind === 'video');
  if (invalid && selectedMusic) {
    setSelectedMusic(null);
  }
}, [selectedMediaList, selectedMusic]);
```

---

## Native / deps

- `@react-native-documents/picker` — device audio pick (`types.audio`)
- `react-native-nitro-media-kit` + `react-native-nitro-modules` — image → silent video, merge clips
- `PhotoMusicComposer` (app native module) — FFmpeg (Android) / AVFoundation (iOS) trim + mux
- `react-native-sound` — probe audio duration
- `react-native-fs` — copy URIs to cache
- `react-native-video` — trim preview playback
- iOS: `PhotoMusicComposer.swift` + `.m` in Xcode project; `pod install` after dep changes
- Android: `PhotoMusicComposerPackage` registered in `MainApplication.kt`; rebuild after Gradle sync

---

## Phase 2 extension points

| Feature | Approach |
|---------|----------|
| CreatePostEdit | Reuse MusicPicker; mux on update if new music attached |
| Licensed catalog | Replace `pickAudioFile` with API search; keep `SelectedMusic` shape |
| Playback overlay | Backend stores `audio_url`; feed plays synced audio over static image |
| Feed attribution chip | Add `musicTitle` to post schema; render marquee on PostComponent |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Too many images error | Clip too short for image count | Shorten image list or extend music clip (min 1s/slide) |
| Native module not linked | Skipped rebuild | Rebuild app; verify `PhotoMusicComposer` in native project |
| Image decode failed | `file://` passed to `convertImageToVideo` | Use bare filesystem path from `resolveLocalImagePath` |
| Upload network error | axios used for FormData | Use existing `uploadWithFetch` in `home.ts` |
| Done pops to Home | Extra `goBack()` after navigate | Use `navigate({ merge: true })` only |
| Music cleared after 2nd image | Old single-image guard | Only clear on video or empty media list |

---

## Manual test checklist

- [ ] Single image + MP3 → mux → upload → appears as video in feed
- [ ] 2+ images + MP3 → slideshow video with equal slide timing
- [ ] 10 images + 5s clip → `musicTooManyImagesForClip` error
- [ ] Add music with 1 image, add 2nd image → music retained
- [ ] Add video after music → music cleared
- [ ] Remove music → posts as normal multi-image carousel
- [ ] Trim start + duration reflected in output length
- [ ] Android `content://` and iOS `file://` audio URIs
- [ ] Compose progress message during multi-image post
- [ ] Cancel MusicPicker — music state unchanged on CreatePost
