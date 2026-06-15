# Background Music on Photo Posts — Full Reference

**Read this before changing music pick, trim, preview, mux, or upload behavior.**

Related: [CREATE_POST_MEDIA_FLOW.md](CREATE_POST_MEDIA_FLOW.md) (image pick → MediaEditor → upload)

---

## End-to-end flow

```
CreatePost (single image in media list)
  → Tap Add Music
  → MusicPicker screen
      → useMusicPicker.pickAudioFile (@react-native-documents/picker)
      → Trim clip (start offset + duration, max 30s)
      → Preview image + audio (react-native-video)
      → Done: navigation.navigate({ selectedMusic }) — NEVER goBack() after this
  → CreatePost receives selectedMusic via useFocusEffect
  → handlePost:
      → composePhotoMusicVideo (native: image → video + audio mux)
      → buildPostVideoFile → FormData file[0] via fetch
  → Feed renders muxed post as inline video (existing PostComponent path)
```

---

## Hard rules (never break)

| # | Rule |
|---|------|
| 1 | Music is **images only** — hide/disable when video is selected; clear music if user adds video. |
| 2 | **v1: single image + music** — multiple images show toast; carousel slideshow mux = Phase 2. |
| 3 | **At least one image required** before Add Music. |
| 4 | Max clip duration **30 seconds** (`MAX_MUSIC_CLIP_SECONDS` in `backgroundMusic.ts`). |
| 5 | Mux output uploads as **one video file** via `buildPostVideoFile` + existing fetch upload. |
| 6 | Never hardcode track names — use file metadata + `unknownTrack` i18n fallback. |
| 7 | Copy `content://` / `ph://` URIs to cache before FFmpeg (`resolveLocalAudioPath`, `resolveLocalImagePath`). |
| 8 | FormData uploads use native **fetch** (see `.cursor/rules/formdata-upload-network-error.mdc`). |
| 9 | After MusicPicker finishes: `navigation.navigate({ name: 'CreatePost', params: { selectedMusic }, merge: true })` only — extra `goBack()` pops past CreatePost. |

---

## Key files

| File | Role |
|------|------|
| `src/screens/CreatePost/index.tsx` | Music state, Add Music guards, mux on post |
| `src/screens/MusicPicker/index.tsx` | Pick audio, trim clip, preview, return `selectedMusic` |
| `src/hooks/useMusicPicker.ts` | Document picker + cache copy |
| `src/utils/backgroundMusic.ts` | URI resolve, FFmpeg mux, label formatting |
| `src/types/backgroundMusic.ts` | `SelectedMusic`, route params |
| `src/utils/mediaEditor.ts` | `resolveLocalImagePath` reused for image mux input |
| `src/utils/helpers.tsx` | `buildPostVideoFile`, `prepareVideoUriForUpload` |

---

## Types

```typescript
// src/types/backgroundMusic.ts
export type SelectedMusic = {
  uri: string;            // cached local audio path
  name: string;           // display title (filename without extension)
  mimeType: string;       // audio/mpeg, audio/mp4, etc.
  durationMs: number;     // full track length
  clipStartMs: number;    // trim offset
  clipDurationMs: number; // segment length (<= MAX_MUSIC_CLIP_SECONDS)
};
```

---

## FFmpeg mux reference

Function: `composePhotoMusicVideo` in `src/utils/backgroundMusic.ts`

Uses **native platform APIs** (no FFmpeg — FFmpegKit binaries were retired):

1. `trim()` from `react-native-video-trim` (headless, `type: 'audio'`, `outputExt: 'm4a'`) — extract the selected clip segment
2. `convertImageToVideo()` from `react-native-nitro-media-kit` — still image → silent H.264 MP4
3. `addAudio()` from `react-native-video-lab` — mux trimmed M4A audio onto silent video

**Input:** cached image path + `SelectedMusic` clip window  
**Output:** `file://.../photo-music-{timestamp}.mp4` in app cache

**Tunables** (change in `backgroundMusic.ts` only):

| Constant | Default | Purpose |
|----------|---------|---------|
| `MAX_MUSIC_CLIP_SECONDS` | 30 | Max selectable clip length |
| `MAX_OUTPUT_LONG_EDGE` | 1080 | Scale cap (matches photo resize in useImagePicker) |
| `OUTPUT_FPS` | 30 | Video frame rate for still loop |

---

## Integration snippets

### Open MusicPicker from CreatePost

```typescript
navigation.navigate('MusicPicker', {
  imageUri: selectedMediaList[0].uri,
  imageName: selectedMediaList[0].name,
});
```

### Receive selected music

```typescript
useFocusEffect(
  useCallback(() => {
    const music = route.params?.selectedMusic as SelectedMusic | undefined;
    if (music) {
      setSelectedMusic(music);
      navigation.setParams({ selectedMusic: undefined });
    }
  }, [navigation, route.params?.selectedMusic]),
);
```

### Post with music

```typescript
if (selectedMusic && selectedMediaList.length === 1) {
  const videoUri = await composePhotoMusicVideo({
    imageUri: selectedMediaList[0].uri,
    music: selectedMusic,
  });
  const file = await buildPostVideoFile(videoUri, 'post_music.mp4', 'video/mp4');
  body.append('file[0]', file as any);
} else {
  // existing image/video loop
}
```

### Clear music when media changes

```typescript
useEffect(() => {
  const invalid =
    selectedMediaList.length !== 1 ||
    selectedMediaList[0]?.kind === 'video' ||
    !selectedMediaList[0]?.uri;
  if (invalid && selectedMusic) {
    setSelectedMusic(null);
  }
}, [selectedMediaList]);
```

---

## Native / deps

- `@react-native-documents/picker` — device audio pick (`types.audio`)
- `react-native-nitro-media-kit` + `react-native-nitro-modules` — image → silent video (AVFoundation / MediaCodec)
- `react-native-video-lab` — audio trim + mux onto video
- `react-native-sound` — probe audio duration (already in project)
- `react-native-fs` — copy URIs to cache
- `react-native-video` — trim preview playback
- iOS: `pod install` after native dep changes
- Android: rebuild after Gradle sync

### FFmpegKit retirement note

FFmpegKit official binaries were removed in 2025. This feature uses **native media APIs** instead. Do not re-add `ffmpeg-kit-react-native` unless you vendor binaries locally (see community guides).

---

## Phase 2 extension points

| Feature | Approach |
|---------|----------|
| Carousel + music | FFmpeg concat filter: N images × equal seconds + one audio bed |
| CreatePostEdit | Reuse MusicPicker; mux on update if new music attached |
| Licensed catalog | Replace `pickAudioFile` with API search; keep `SelectedMusic` shape |
| Playback overlay | Backend stores `audio_url`; feed plays synced audio over static image |
| Feed attribution chip | Add `musicTitle` to post schema; render marquee on PostComponent |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| FFmpeg "No such file" | Raw `content://` passed to mux | Run `resolveLocalImagePath` / `resolveLocalAudioPath` first |
| Native module not linked | Skipped pod install / rebuild | Run `cd ios && pod install` and rebuild the app |
| Pick returns wrong type | Android provider ignores filter | Check `hasRequestedType` on picker response |
| Compose failure | Native trim/mux error | Verify audio is MP3/M4A; rebuild app after installing native deps |
| Upload network error | axios used for FormData | Use existing `uploadWithFetch` in `home.ts` |
| Done pops to Home | Extra `goBack()` after navigate | Remove goBack; use `navigate({ merge: true })` only |
| Music row shows with video | Missing guard | Clear music when `kind === 'video'` |

---

## Manual test checklist

- [ ] Single image + MP3 → mux → upload → appears as video in feed
- [ ] Add Music disabled when no image / multiple images / video selected
- [ ] Remove music → posts as normal image
- [ ] Trim start + duration reflected in output length
- [ ] Android `content://` and iOS `file://` audio URIs
- [ ] Compose failure shows toast, does not crash
- [ ] i18n strings (no hardcoded English in production paths)
- [ ] Cancel MusicPicker — music state unchanged on CreatePost
