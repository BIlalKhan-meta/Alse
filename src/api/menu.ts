import axiosInstance from '.';
import endpoints from './endpoints';

export const getSavedItems = () => {
  return axiosInstance.get(endpoints.menu.getSavedItems);
};
