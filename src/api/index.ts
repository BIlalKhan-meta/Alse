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
    // console.log(token, 'tokennnn', config, 'Configgggggg');
    if (!config.headers) {
      config.headers = {};
    }

    // If formData flag is true, do NOT set Content-Type so the runtime can set
    // multipart/form-data with the correct boundary (required for file uploads).
    if (config.formData) {
      config.headers['Accept'] = 'application/json';
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // console.log('HEADERRSSSSSSSSSS', config.headers);

    return config;
  },
  error => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status == 401) {
      store.dispatch(logout());
    }
    if (error.response && error.response.status == 422) {
      return Promise.reject(error.response?.data);
    }
    if (error.response && error.response.status == 405) {
      return Promise.reject(error.response?.data);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
