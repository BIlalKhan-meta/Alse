import axiosInstance from '.';
import endpoints from './endpoints';
import {postFormDataWithFetch} from './product';

export const getAllShop = () => {
  return axiosInstance.get(endpoints.shop.allShop);
};

/** Multipart POST; uses fetch so React Native multipart uploads behave reliably on Android. */
export const createShop = (formData: FormData) =>
  postFormDataWithFetch(endpoints.shop.createShop, formData);

export const shopDetail = (id: number) => {
  return axiosInstance.get(`${endpoints.shop.shopDetail}/${id}`);
};

export const getProductByShop = (id: number) => {
  return axiosInstance.get(`${endpoints.shop.shopDetail}/${id}/products`);
};

export const updateShop = (formData: FormData, id: number) => {
  return axiosInstance.post(`${endpoints.shop.updateShop}/${id}`, formData, {
    formData: true,
  });
};

export const createProduct = (formData: FormData, id: number) =>
  postFormDataWithFetch(
    `${endpoints.shop.shopDetail}/${id}/product/create`,
    formData,
  );

export const updateProduct = (
  formData: FormData,
  shopId: number,
  productId: number,
) =>
  postFormDataWithFetch(
    `${endpoints.shop.shopDetail}/${shopId}/product/update/${productId}`,
    formData,
  );

export const checkIsSeller = () => {
  return axiosInstance.get(endpoints.shop.isSeller);
};
