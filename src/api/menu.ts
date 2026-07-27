import axiosInstance from '.';
import endpoints from './endpoints';

export const getSavedItems = (params?: {
  type?: string;
  page?: number;
  per_page?: number;
}) => {
  return axiosInstance.get(endpoints.menu.getSavedItems, {params});
};
export const getAboutUs = () => {
  return axiosInstance.get(endpoints.menu.aboutUs);
};
export const getBank = () => {
  return axiosInstance.get(endpoints.menu.banks);
};
export type SaveItemPayload = {
  item_type: 'post' | 'product' | 'blog' | 'article' | 'video' | 'shop' | string;
  item_id: number | string;
};

export const removeSavedItem = (data: SaveItemPayload) => {
  return axiosInstance.post(endpoints.menu.removeSaved, data);
};

export const saveItem = (data: SaveItemPayload) => {
  return axiosInstance.post(endpoints.menu.saveItem, data);
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
