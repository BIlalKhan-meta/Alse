import {Platform} from 'react-native';
import axiosInstance from '.';
import endpoints from './endpoints';

export const googleLogin = (data: {
  token: string;
}) => {
  const formData = new FormData();
  formData.append('token', data.token);
  return axiosInstance.post(endpoints.auth.login, formData, {
    formData: true,
  });
};

export const appleLogin = (data: {
  email: string;
  fullName: string;
  isAppleLogin: boolean;
  apple_id: string;
}) => {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('full_name', data.fullName);
  formData.append('is_apple_login', data.isAppleLogin);
  formData.append('apple_id', data.apple_id);
  return axiosInstance.post(endpoints.auth.login, formData, {
    formData: true,
  });
};


export const login = (data: {
  identifier: string;
  password?: string;
  token: string;
}) => {
  // Initialize FormData
  const formData = new FormData();
  formData.append('identifier', data.identifier);
  formData.append('password', data.password);
  formData.append('device_id', data.token);
  formData.append('device_type', Platform.OS == 'ios' ? 'ios' : 'android');
  // Make API request with FormData
  return axiosInstance.post(endpoints.auth.login, formData, {
    formData: true, // This triggers the form-data handling in the interceptor
  });
};

// Signup API call
export const signup = (formData: any) => {
  return axiosInstance.post(endpoints.auth.signup, formData, {
    formData: true,
  });
};

export const forgotPassword = (data: {identifier: string}) => {
  console.log(data, 'ForgetData frommmm authhhh ');

  const formData = new FormData();
  formData.append('identifier', data.identifier);

  return axiosInstance.post(endpoints.auth.forgotPassword, formData, {
    formData: true,
  });
};

export const verifyOtp = (data: {email: string; code: number}) => {
  console.log(data, 'ForgetData frommmm authhhh ');

  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('code', data.code);
  return axiosInstance.post(endpoints.auth.verifyOtp, formData, {
    formData: true,
  });
};

export const resetPassword = (data: {
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('confirm_password', data.confirmPassword);

  return axiosInstance.post(endpoints.auth.resetPassword, formData, {
    formData: true,
  });
};

export const logout = () => {
  return axiosInstance.post(`${endpoints.auth.logout}`);
};
