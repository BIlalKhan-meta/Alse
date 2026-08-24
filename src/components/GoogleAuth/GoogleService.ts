import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {Platform} from 'react-native';

let isConfigured = false;

export function configureGoogleSignin() {
  if (isConfigured) {
    return;
  }

  GoogleSignin.configure({
    // MUST be the Web OAuth client ID (used to mint idToken).
    // From GCP project alse-f5276 → Credentials → Web client.
    webClientId:
      '1021861190165-8ifik07pk5cb0qj8h9egjg4bvv7evojv.apps.googleusercontent.com',
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
  isConfigured = true;
}

export async function signInWithGoogle() {
  configureGoogleSignin();

  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    }

    const current = await GoogleSignin.getCurrentUser();
    if (current) {
      try {
        await GoogleSignin.signOut();
      } catch {
        // ignore sign-out errors before fresh login
      }
    }

    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    return {userInfo, tokens};
  } catch (e: any) {
    if (
      e?.code === statusCodes.SIGN_IN_CANCELLED ||
      e?.code === statusCodes.IN_PROGRESS
    ) {
      return null;
    }
    throw e;
  }
}

export async function signOutWithGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Error signing out Google:', error);
    throw error;
  }
}
