/**
 * Single Agora App ID used for both RTC (audio/video) and RTM (signaling).
 * Must match the App ID your backend uses to generate tokens.
 * Same as letsPlanADate project.
 */
export const AGORA_APP_ID = '202b3fa92dbf44dc84f2925c9c6aee69';

/** @deprecated Use AGORA_APP_ID — kept as alias so existing imports don't break. */
export const AGORA_RTC_APP_ID = AGORA_APP_ID;
