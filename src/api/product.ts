import axiosInstance from '.';
import endpoints from './endpoints';

export const productDetail = (id: number) => {
  return axiosInstance.get(`${endpoints.products.productDetail}/${id}`);
};

export const DeliverOrder = (id: number) => {
  return axiosInstance.post(`${endpoints.products.acceptOrder}${id}/delivered`);
};
export const AcceptOrder = (id: number) => {
  return axiosInstance.post(`${endpoints.products.acceptOrder}${id}/accepted`);
};
export const RejectOrder = (data, id) => {
  return axiosInstance.post(
    `${endpoints.products.acceptOrder}${id}/cancelled`,
    data,
  );
};
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
export const getOrders = (params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) => {
  return axiosInstance.get(`${endpoints.products.ordersList}`, {params});
};
export const getMyOrders = (params?: {
  page?: number;
  per_page?: number;
  status?: string;
}) => {
  return axiosInstance.get(`${endpoints.products.shopOrders}`, {params});
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

export const getRecommendedProducts = () => {
  return axiosInstance.get(endpoints.products.recommended);
};

// Get all products with optional filters
export const getAllProducts = (params?: {
  search?: string;
  category_id?: number;
  sort?: string;
  per_page?: number;
  min_price?: number;
  max_price?: number;
}) => {
  return axiosInstance.get(endpoints.products.allProducts, {params});
};

// Get products with search and category filter
export const searchProducts = (
  search: string,
  categoryId?: number,
  sort?: string,
  perPage?: number,
) => {
  const params: any = {search};
  if (categoryId) params.category_id = categoryId;
  if (sort) params.sort = sort;
  if (perPage) params.per_page = perPage;
  return axiosInstance.get(endpoints.products.allProducts, {params});
};

// Get products with price range filter
export const getProductsByPriceRange = (
  minPrice: number,
  maxPrice: number,
  sort?: string,
) => {
  const params: any = {min_price: minPrice, max_price: maxPrice};
  if (sort) params.sort = sort;
  return axiosInstance.get(endpoints.products.allProducts, {params});
};
