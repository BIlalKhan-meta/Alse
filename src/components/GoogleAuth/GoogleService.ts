import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
  } from '@react-native-google-signin/google-signin';

import { Platform } from 'react-native';


const GOOGLE_CLIENT_ID = '356485755638-s376ec8ugua8tr2mdfcfjtqqn1090tdp.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '356485755638-eenksnfr7lp4jpfcem1eclvgkne4gjuo.apps.googleusercontent.com';
const GOOGLE_IOS_URL_SCHEME = 'com.googleusercontent.apps.356485755638-s376ec8ugua8tr2mdfcfjtqqn1090tdp'

export const signInWithGoogle = async () => {

    try {
        GoogleSignin.configure({
            iosClientId: GOOGLE_CLIENT_ID,
            ...(Platform.OS === 'android' && {
                androidClientId: GOOGLE_ANDROID_CLIENT_ID
            })
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