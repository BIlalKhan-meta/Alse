import {Platform} from 'react-native';
import axiosInstance from '.';
import endpoints from './endpoints';

export const googleLogin = (data: {
  token: string;
  deviceId?: string;
  fcmToken?: string;
}) => {
  const formData = new FormData();
  formData.append('token', data.token);
  if (data.deviceId) {
    formData.append('device_id', data.deviceId);
    formData.append('device_type', Platform.OS === 'ios' ? 'ios' : 'android');
  }
  if (data.fcmToken) {
    formData.append('fcm_token', data.fcmToken);
  }
  return axiosInstance.post(endpoints.auth.login, formData, {
    formData: true,
  });
};

export const appleLogin = (data: {
  email?: string;
  fullName: string;
  givenName?: string;
  familyName?: string;
  isAppleLogin: boolean;
  apple_id: string;
  identityToken: string;
  authorizationCode?: string;
  deviceId?: string;
  fcmToken?: string;
}) => {
  const formData = new FormData();
  if (data.email) {
    formData.append('email', data.email);
  }
  formData.append('full_name', data.fullName);
  if (data.givenName) {
    formData.append('given_name', data.givenName);
  }
  if (data.familyName) {
    formData.append('family_name', data.familyName);
  }
  formData.append('is_apple_login', String(data.isAppleLogin));
  formData.append('apple_id', data.apple_id);
  formData.append('identity_token', data.identityToken);
  if (data.authorizationCode) {
    formData.append('authorization_code', data.authorizationCode);
  }
  if (data.deviceId) {
    formData.append('device_id', data.deviceId);
    formData.append('device_type', Platform.OS === 'ios' ? 'ios' : 'android');
  }
  if (data.fcmToken) {
    formData.append('fcm_token', data.fcmToken);
  }
  return axiosInstance.post(endpoints.auth.login, formData, {
    formData: true,
  });
};

export const login = (data: {
  identifier: string;
  password: string;
  deviceId?: string;
  fcmToken?: string;
  /** @deprecated use fcmToken + deviceId */
  token?: string;
}) => {
  const deviceId = data.deviceId || data.token;
  const fcmToken = data.fcmToken || data.token;
  return axiosInstance.post(endpoints.auth.login, {
    identifier: data.identifier,
    password: data.password,
    device_id: deviceId || undefined,
    fcm_token: fcmToken || undefined,
    device_type: Platform.OS === 'ios' ? 'ios' : 'android',
  });
};

// Signup API call
export const signup = (formData: any) => {
  return axiosInstance.post(endpoints.auth.signup, formData, {
    formData: true,
  });
};

// Seller Signup API call
export const signupSeller = (data: {
  full_name: string;
  bio: string;
  address: string;
  phone_number: string;
  country_id: number;
  password: string;
  password_confirmation: string;
}) => {
  const formData = new FormData();
  formData.append('full_name', data.full_name);
  formData.append('bio', data.bio);
  formData.append('address', data.address);
  formData.append('phone_number', data.phone_number);
  formData.append('country_id', data.country_id.toString());
  formData.append('password', data.password);
  formData.append('password_confirmation', data.password_confirmation);

  return axiosInstance.post(endpoints.auth.signupSeller, formData, {
    formData: true,
  });
};

export const forgotPassword = (data: { identifier: string }) => {
  return axiosInstance.post(endpoints.auth.forgotPassword, {
    identifier: data.identifier,
  });
};

export const verifyOtp = (data: { email: string; code: number }) => {
  return axiosInstance.post(endpoints.auth.verifyOtp, {
    email: data.email,
    code: data.code,
  });
};

export const resetPassword = (data: {
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  return axiosInstance.post(endpoints.auth.resetPassword, {
    email: data.email,
    password: data.password,
    confirm_password: data.confirmPassword,
  });
};

export const logout = () => {
  return axiosInstance.post(`${endpoints.auth.logout}`);
};
