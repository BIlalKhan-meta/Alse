# Feed Session Time Tracking and Wellness Warnings

This document describes how feed session timing and wellness break popups work in the Alse app.

## Overview

When the user browses the **News Feed** (`src/screens/Home/Feed/index.tsx`), the app tracks how long the feed is actively open and shows optional wellness reminders at **15**, **30**, and **45 minutes** of cumulative feed time per app launch.

User-facing copy (localized):

- Title: `feed.wellnessTitle` — e.g. "Time for a break?"
- Message: `feed.wellnessMessage` — e.g. "You've been browsing for 30 minutes. Take a break?"
- Actions: **Continue** / **Close Feed**

## Architecture

```
Feed/index.tsx
  └── useFeedSessionTracking(navigation)
        ├── useFocusEffect → start/pause feed segment
        ├── AppState listener → pause on background
        ├── 1s interval → update elapsed + detect thresholds
        └── FeedWellnessModal → mid-screen popup

src/utils/feedSessionTracking.ts
  └── module-level session store (resets on cold app start)
```

### File map

| File | Purpose |
|------|---------|
| `src/utils/feedSessionTracking.ts` | Session store, elapsed time, threshold detection |
| `src/hooks/useFeedSessionTracking.ts` | React hook: focus, AppState, interval, modal state |
| `src/components/FeedWellnessModal/index.tsx` | Centered blur modal UI |
| `src/components/FeedWellnessModal/styles.tsx` | Modal styles |
| `src/screens/Home/Feed/index.tsx` | Integration point |
| `src/i18n/locales/*.ts` | `feed.wellness*` strings (7 locales) |

## What is tracked

### 1. Current feed segment (`currentSegmentMs`)

Time since the feed **last gained focus** in the current open stretch. Resets to `0` when the feed blurs or the app backgrounds.

### 2. Total feed session duration (`totalFeedMs`)

**Cumulative** time the feed was focused during the current app launch. Persists across tab switches and navigation away/back within the same app session.

Example:

1. User on Feed for 10 min → `totalFeedMs ≈ 10 min`
2. Switch to Search tab → timer pauses, `totalFeedMs` stays at 10 min
3. Return to Feed for 6 min → `totalFeedMs ≈ 16 min` → **15 min warning** shows

## Timer rules

### Start counting

- Feed screen gains focus (`useFocusEffect` callback)
- App is in `active` foreground state

### Pause counting

- Feed loses focus (tab switch, stack push to `ChatScreen`, `CreatePost`, etc.)
- App goes to `background` or `inactive`

### Stop segment (flush to cumulative)

On pause, the active segment duration is added to `cumulativeFeedMs` and `segmentStartAt` is cleared.

## Wellness thresholds

Constants in `feedSessionTracking.ts`:

```ts
WELLNESS_THRESHOLDS_MINUTES = [15, 30, 45]
```

### When a popup appears

- Cumulative feed time crosses a threshold
- Feed is focused and app is foreground
- That threshold has **not** been shown yet this app launch

### Which threshold is shown

The helper `getNextThresholdToShow()` checks **45 → 30 → 15** and returns the **highest** crossed threshold that has not been shown. This avoids showing the 15-minute warning after the user has already passed 30 minutes (e.g. long background return).

### After user action

| Action | Behavior |
|--------|----------|
| **Close** | Mark current threshold as shown; dismiss modal; timer keeps running |
| **Close Feed** | Mark threshold shown; dismiss modal; navigate to **Profile** tab (`MyProfile`) |
| Backdrop tap | Same as **Close** |

If the user is on the Feed root, **Close Feed** navigates to the Profile tab.

## Hook API

```ts
const {
  activeThreshold,    // 15 | 30 | 45 | null
  totalFeedMs,        // cumulative feed ms
  currentSegmentMs,   // current open segment ms
  dismissWarning,     // Continue handler
  closeFeed,          // Close Feed handler
  isWarningVisible,   // boolean for modal visibility
} = useFeedSessionTracking(navigation);
```

## i18n keys

Add under `feed` in each locale file:

| Key | English |
|-----|---------|
| `feed.wellnessTitle` | Time for a break? |
| `feed.wellnessMessage` | You've been browsing for {{minutes}} minutes. Take a break? |
| `feed.wellnessClose` | Close |
| `feed.wellnessCloseFeed` | Close Feed |

## Manual test checklist

1. **Feed open** — Open Home/Feed; timer should start (no popup before 15 min).
2. **Tab switch** — Switch to Search; return to Feed; cumulative time should continue from before.
3. **Stack navigation** — Open Chat from FAB; timer pauses; go back; timer resumes.
4. **App background** — Background app on Feed; foreground again; timer resumes, background time not counted.
5. **15 min warning** — After 15 min cumulative feed time, modal appears with correct message.
6. **Continue** — Dismisses modal; 15 min warning does not reappear; 30 min warning still pending.
7. **30 / 45 min** — Repeat for higher thresholds.
8. **Close Feed from stack** — Open Chat, trigger warning after threshold, tap Close Feed → returns to Feed.
9. **Close Feed at root** — On Feed root, Close Feed dismisses modal only.
10. **Video pause** — Confirm feed videos still pause when leaving the feed tab (no regression).

## QA / development testing

Wellness thresholds are always **15 / 30 / 45 minutes** of cumulative feed time (dev and production).

`resetFeedSessionForTests()` is exported for unit tests only.

## Out of scope (future work)

- **Settings toggle** to disable wellness reminders (`AsyncStorage` or user settings API)
- **Analytics** — suggested events when PostHog or similar is added:
  - `feed_session_segment_started`
  - `feed_session_segment_paused`
  - `feed_wellness_warning_shown` (`{ minutes: 15 | 30 | 45 }`)
  - `feed_wellness_continue`
  - `feed_wellness_close_feed`
- **Persist shown thresholds** across app restarts (currently reset each cold start)
- **App-wide session duration** separate from feed time (only feed time is tracked today)

## Related code

- Feed video focus: `isScreenFocused` in `Feed/index.tsx` (unchanged; separate from session timer)
- Similar modal pattern: `src/components/GeneralModal` (not used here to avoid backdrop → Close Feed behavior)
