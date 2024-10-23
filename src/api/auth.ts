import {Platform} from 'react-native';
import axiosInstance from '.';
import endpoints from './endpoints';

export const login = (data: {
  email: string;
  password: string;
  token: string;
}) => {
  // Initialize FormData
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('device_id', data.token);
  formData.append('device_type', Platform.OS == 'ios' ? 'ios' : 'android');
  // Make API request with FormData
  return axiosInstance.post(endpoints.auth.login, formData, {
    formData: true, // This triggers the form-data handling in the interceptor
  });
};

// Signup API call
export const signup = (data: {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  image: any;
  dialing_code: string;
  phone_number: string;
  gender: string;
  dob: string;
}) => {
  console.log(data, 'Data frommmm authhhh ');
  // Initialize FormData
  const formData = new FormData();
  formData.append('first_name', data.first_name);
  formData.append('last_name', data.last_name);
  formData.append('username', data.username);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('image', data.image);
  formData.append('dialing_code', data.dialing_code);
  formData.append('phone_number', data.phone_number);
  formData.append('gender', data.gender);
  formData.append('dob', data.dob);

  // Make API request with FormData
  return axiosInstance.post(endpoints.auth.signup, formData, {
    formData: true,
  });
};

export const forgotPassword = (data: {email: string}) => {
  console.log(data, 'ForgetData frommmm authhhh ');

  const formData = new FormData();
  formData.append('email', data.email);

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
