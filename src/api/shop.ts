import axiosInstance from '.';
import endpoints from './endpoints';

export const getAllShop = () => {
  return axiosInstance.get(endpoints.shop.allShop);
};

export const createShop = (formData: FormData) => {
  console.log(formData, 'Formmmm Dataaaa Createee possttt');
  return axiosInstance.post(endpoints.shop.createShop, formData, {
    formData: true, // This triggers the form-data handling in the interceptor
  });
};

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

export const createProduct = (formData: FormData, id: number) => {
  // console.log(formData, id, 'Formmmm Dataaaa Createee possttt');
  return axiosInstance.post(
    `${endpoints.shop.shopDetail}/${id}/product/create`,
    formData,
    {
      formData: true, // This triggers the form-data handling in the interceptor
    },
  );
};

export const updateProduct = (
  formData: FormData,
  shopId: number,
  productId: number,
) => {
  // console.log(formData, id, 'Formmmm Dataaaa Createee possttt');
  return axiosInstance.post(
    `${endpoints.shop.shopDetail}/${shopId}/product/update/${productId}`,
    formData,
    {
      formData: true, // This triggers the form-data handling in the interceptor
    },
  );
};
