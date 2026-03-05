import { Platform } from 'react-native';
import axiosInstance from '.';
import endpoints from './endpoints';

export const googleLogin = (data: { token: string }) => {
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
  password: string;
  token: string;
}) => {
  // API expects JSON body per docs - FormData can cause 422/rejection
  return axiosInstance.post(endpoints.auth.login, {
    identifier: data.identifier,
    password: data.password,
    device_id: data.token || undefined,
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
  const formData = new FormData();
  // Backend expects "identifier" (email or phone number)
  formData.append('identifier', data.identifier);

  console.log('FormData being sent:', {
    identifier: data.identifier
  });

  return axiosInstance.post(endpoints.auth.forgotPassword, {
    identifier: data.identifier,
  });
};

export const verifyOtp = (data: { email: string; code: number }) => {
  console.log(data, 'ForgetData frommmm authhhh ');


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
    confirm_password: data.confirmPassword
  });
};

export const logout = () => {
  return axiosInstance.post(`${endpoints.auth.logout}`);
};
