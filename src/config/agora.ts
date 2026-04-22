/** Replace with your Agora App ID (must match RTM + RTC project). */
export const AGORA_APP_ID = '202b3fa92dbf44dc84f2925c9c6aee69';

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
 * Signaling (RTM/Signaling SDK) token.
 *
 * IMPORTANT: The RTM SDK requires a token field (cannot be nil/undefined).
 * - If your Agora project has App Certificate disabled, you can use a placeholder token
 * - For production, generate a Signaling token server-side and provide it here
 * - Placeholder token below is for development/testing only
 */
export const AGORA_SIGNALING_TOKEN = '';

// Call invitation timeout (in seconds)
export const CALL_TIMEOUT_SECONDS = 30;
