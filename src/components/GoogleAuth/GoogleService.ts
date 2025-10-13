// import {
//     GoogleSignin,
//     GoogleSigninButton,
//     statusCodes,
// } from '@react-native-google-signin/google-signin';
// import { Platform } from 'react-native';

// const GOOGLE_CLIENT_ID = '356485755638-s376ec8ugua8tr2mdfcfjtqqn1090tdp.apps.googleusercontent.com';
// const GOOGLE_WEB_CLIENT_ID = '356485755638-e0a5emd750sgdvivpupqnnaplp55mtbc.apps.googleusercontent.com';
// const GOOGLE_IOS_URL_SCHEME = 'com.googleusercontent.apps.356485755638-s376ec8ugua8tr2mdfcfjtqqn1090tdp'

// export const configureGoogleSignIn = () => {
//     GoogleSignin.configure({
//         iosClientId: GOOGLE_CLIENT_ID,
//         webClientId: GOOGLE_WEB_CLIENT_ID
//     });
// };

// export const signInWithGoogle = async () => {
//     try {

//         configureGoogleSignIn();

//         // Make sure the user can use Google Play services
//         // if (Platform.OS === 'android') {
//         //     await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
//         // }

//         // Check if user is already signed in
//         const isSignedIn = GoogleSignin.getCurrentUser();
//         if (isSignedIn) {
//             await GoogleSignin.signOut(); // Sign out first to ensure a fresh login
//         }

//         // Perform the sign-in
//         const userInfo = await GoogleSignin.signIn();
//         console.log("Successfully signed in:", userInfo);
//         return userInfo;
//     } catch (error) {
//         if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//             console.log("User cancelled the login flow");
//         } else if (error.code === statusCodes.IN_PROGRESS) {
//             console.log("Sign in is in progress already");
//         } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//             console.log("Play services not available or outdated");
//         }
//         else {
//             console.log("GOOGLE ERROR", error);
//         }
//         throw error;
//     }
// };

// export const signOutWithGoogle = async () => {
//     try {
//         await GoogleSignin.signOut();
//         console.log("User signed out successfully");
//     } catch (error) {
//         console.error("Error signing out:", error);
//         throw error;
//     }
// };

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

  try {
    const userInfo = await GoogleSignin.signIn(); // Opens Google account chooser
    //   console.log('=-=-=', userInfo);
    // If you also want tokens:
    const tokens = await GoogleSignin.getTokens(); // { idToken?, accessToken? }
    //   console.log('=-=-=', tokens);
    return {userInfo, tokens};
  } catch (e: any) {
    if (e.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled
      return null;
    }
    throw e;
  }
}

export async function signOutWithGoogle() {
  await GoogleSignin.signOut(); // local session
  // await GoogleSignin.revokeAccess(); // fully disconnect (optional)
}

export function configureGoogleSignin() {
  GoogleSignin.configure({
    // MUST be the Web OAuth client ID:
    webClientId:
      '222536459203-1lkur745cuve2kiujol18phtdvg3qd7c.apps.googleusercontent.com',

    // Optional:
    offlineAccess: false,
    forceCodeForRefreshToken: false,
    // scopes: ['profile', 'email'],
  });
}
