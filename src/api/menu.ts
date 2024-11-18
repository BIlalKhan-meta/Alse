import axiosInstance from '.';
import endpoints from './endpoints';

export const getSavedItems = () => {
  return axiosInstance.get(endpoints.menu.getSavedItems);
};
export const getAboutUs = () => {
  return axiosInstance.get(endpoints.menu.aboutUs);
};
export const getBank = () => {
  return axiosInstance.get(endpoints.menu.banks);
};
export const removeSavedItem = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.menu.removeSaved}`, formData, {
    formData: true,
  });
};

export const saveItem = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.menu.saveItem}`, formData, {
    formData: true,
  });
};
export const updateBank = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.menu.updateBank}`, formData, {
    formData: true,
  });
};
export const createBank = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.menu.createBank}`, formData, {
    formData: true,
  });
};

export const contactUs = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.menu.contactUs}`, formData, {
    formData: true,
  });
};
