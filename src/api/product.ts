import axiosInstance from '.';
import endpoints from './endpoints';

export const productDetail = (id: number) => {
  return axiosInstance.get(`${endpoints.products.productDetail}/${id}`);
};

export const productRating = (id: number) => {
  return axiosInstance.get(`${endpoints.products.productDetail}/${id}/reviews`);
};

export const getCategories = () => {
  return axiosInstance.get(`${endpoints.products.category}`);
};

export const addProductToCart = (id: number) => {
  console.log('addcartttt ', `${endpoints.products.cart}/${id}`);
  return axiosInstance.post(`${endpoints.products.cart}/${id}`);
};

export const getCart = () => {
  return axiosInstance.get(`${endpoints.products.getCart}`);
};
