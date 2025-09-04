import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    formData?: boolean;
  }
}
