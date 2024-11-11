import axiosInstance from '.';
import endpoints from './endpoints';

export const getSavedItems = () => {
  return axiosInstance.get(endpoints.menu.getSavedItems);
};
export const getAboutUs = () => {
  return axiosInstance.get(endpoints.menu.aboutUs);
};
export const removeSavedItem = (id: number) => {
  return axiosInstance.post(`${endpoints.menu.removeSaved}/${id}`);
};

export const saveItem = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.menu.saveItem}`, formData, {
    formData: true,
  });
};
