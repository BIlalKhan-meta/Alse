// src/services/axios.ts
import axios from 'axios';
import store from '../store';
import {logout} from '../store/slices/authSlice';
import {BASE_URL} from '../utils/baseurl';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  config => {
    const token = store.getState().auth.token;

    if (!config.headers) {
      config.headers = {};
    }

    // If formData flag is true, set Content-Type to multipart/form-data
    if (config.formData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
