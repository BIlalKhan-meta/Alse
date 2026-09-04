/** Replace with your Agora App ID (must match RTM + RTC project). */
export const AGORA_APP_ID = '15f9dbf361a54ed1943a49ea9807e53b';

/**
 * IMPORTANT: Agora tokens are channel-specific!
 * 
 * When generating a temp token from Agora Console:
 * 1. Go to https://console.agora.io
 * 2. Select your project -> "Config" -> "Generate temp token"
 * 3. Enter the EXACT channel name you want to use (e.g., "test")
 * 4. Copy the token and paste it below
 * 5. Set AGORA_TOKEN_CHANNEL to the SAME channel name you used
 * 
 * Temp tokens expire after 24 hours. For production, use a token server.
 */

// The channel name the temp RTC token was generated for (e.g. "test") — must match console token
export const AGORA_TOKEN_CHANNEL = 'test';

// Temp token from Agora Console (regenerate if expired)
export const AGORA_TEMP_TOKEN = '';

/**
 * Signaling (RTM) tokens are minted by GET /agora/rtm-token.
 * App Certificate is enabled — do not login with an empty hardcoded token.
 */
export const AGORA_SIGNALING_TOKEN = '';

// Call invitation timeout (in seconds)
export const CALL_TIMEOUT_SECONDS = 30;
