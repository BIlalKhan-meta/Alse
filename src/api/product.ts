import axiosInstance from '.';
import endpoints from './endpoints';

export const productDetail = (id: number) => {
  return axiosInstance.get(`${endpoints.products.productDetail}/${id}`);
};

export const productRating = (id: number) => {
  return axiosInstance.get(`${endpoints.products.productDetail}/${id}/reviews`);
};
