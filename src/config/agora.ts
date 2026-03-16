/**
 * Agora configuration - use the App ID from your NEW-ALSE project in Agora Console.
 * Ensure RTC and RTM use the same App ID. LOGIN_ERR_REJECTED often means App ID mismatch.
 */
export const AGORA_APP_ID = 'd46370a56ec74d4b82785746f650d9b0';

/**
 * RTM token for signaling (incoming call modal).
 * Used when backend getRtmToken returns null. Must match your Agora project.
 */
export const AGORA_RTM_TOKEN =
  '007eJxTYFi6cEplHnOI6tLDejLZFcv9C+bdFdz41Ft5x+t8N4bNXVMVGFJMzIzNDRJNzVKTzU1STJIsjMwtTM1NzNLMTA1SLJMMxHV3ZDYEMjLkla1hYmSAQBCflcHRJ9hVgYEBAAJaHVw=';
