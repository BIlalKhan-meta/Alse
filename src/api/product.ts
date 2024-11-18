import axiosInstance from '.';
import endpoints from './endpoints';

export const productDetail = (id: number) => {
  return axiosInstance.get(`${endpoints.products.productDetail}/${id}`);
};

export const DeliverOrder = (id: number) =>{
  return axiosInstance.post(`${endpoints.products.acceptOrder}${id}/delivered`)
}
export const AcceptOrder = (id: number) =>{
  return axiosInstance.post(`${endpoints.products.acceptOrder}${id}/accepted`)
}
export const RejectOrder = (data, id) =>{
  return axiosInstance.post(`${endpoints.products.acceptOrder}${id}/cancelled`, data)
}
// /get-order-detail/13/accepted

export const productRating = (id: number) => {
  return axiosInstance.get(`${endpoints.products.productDetail}/${id}/reviews`);
};

export const getCategories = () => {
  return axiosInstance.get(`${endpoints.products.category}`);
};

export const addProductToCart = (id: number, formData: FormData) => {
  // console.log('addcartttt ', `${endpoints.products.cart}/${id}`);
  return axiosInstance.post(`${endpoints.products.cart}/${id}`, formData, {
    formData: true,
  });
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
export const getPaymentLogs = () => {
  return axiosInstance.get(`${endpoints.products.paymentLogs}`);
};
export const getSimilarProducts = (id: number) => {
  return axiosInstance.get(`${endpoints.products.similar}/${id}/similar`);
};
