import axiosInstance from '.';
import endpoints from './endpoints';

export const getSavedItems = () => {
  return axiosInstance.get(endpoints.menu.getSavedItems);
};

export const saveItem = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.menu.saveItem}`, formData, {
    formData: true,
  });
};