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
  // console.log('addcartttt ', `${endpoints.products.cart}/${id}`);
  return axiosInstance.post(`${endpoints.products.cart}/${id}`);
};
export const removeCartItem = (id: number) => {
  return axiosInstance.post(`${endpoints.products.removeCartItem}/${id}`);
};
export const productImageDelete = (productId: number, id: number) => {
  return axiosInstance.post(
    `${endpoints.products.deleteProductImage}/${productId}/media/${id}/remove`,
  );
};
export const updateCartItem = (formData: FormData, id: number) => {
  return axiosInstance.post(
    `${endpoints.products.updateCart}/${id}`,
    formData,
    {
      formData: true,
    },
  );
};
export const checkout = (formData: FormData) => {
  return axiosInstance.post(`${endpoints.products.checkout}`, formData, {
    formData: true,
  });
};

export const getCart = () => {
  return axiosInstance.get(`${endpoints.products.getCart}`);
};
export const getOrders = () => {
  return axiosInstance.get(`${endpoints.products.ordersList}`);
};
export const getMyOrders = () => {
  return axiosInstance.get(`${endpoints.products.shopOrders}`);
};
export const getOrderDetail = (id: number) => {
  return axiosInstance.get(`${endpoints.products.orderDetail}/${id}`);
};
