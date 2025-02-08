import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
  } from '@react-native-google-signin/google-signin';


const GOOGLE_CLIENT_ID = '272810491191-f0l1utg4q5la06fuq43si41926gqf8n0.apps.googleusercontent.com';
// const GOOGLE_IOS_URL_SCHEME = 'com.googleusercontent.apps.272810491191-f0l1utg4q5la06fuq43si41926gqf8n0'

export const signInWithGoogle = async () => {

    try {
        GoogleSignin.configure({
            iosClientId: GOOGLE_CLIENT_ID
        });

        const userInfo = await GoogleSignin.signIn();
        return userInfo;
    } catch (error) {
        console.log(error);
    }
}

export const signOutWithGoogle = async () => {
    try {
        await GoogleSignin.configure({
            iosClientId: GOOGLE_CLIENT_ID
        });
    } catch (error) {
        console.log(error);
    }
}