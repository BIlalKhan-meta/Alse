import axiosInstance from '.';
import endpoints from './endpoints';
import store from '../store';
import {BASE_URL} from '../utils/baseurl';

/**
 * POST FormData via fetch. Avoids axios FormData/Android Network Error issues.
 * Returns { data } to match axios response shape for existing callers.
 */
export async function postFormDataWithFetch(
  path: string,
  body: FormData,
): Promise<{data: any}> {
  const token = store.getState().auth.token;
  const url = `${BASE_URL.replace(/\/$/, '')}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err: any = new Error(response.statusText || 'Request failed');
      err.response = {status: response.status, data};
      throw err;
    }
    return {data};
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      const err: any = new Error('Network request timeout');
      err.code = 'ECONNABORTED';
      throw err;
    }
    throw e;
  }
}

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
  return postFormDataWithFetch(`${endpoints.products.cart}/${id}`, formData);
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

export const getShopOrders = (
  shopId: number,
  params?: {
    page?: number;
    per_page?: number;
    status?: string;
  },
) => {
  console.log('getShopOrders called with shopId:', shopId, 'params:', params);
  return axiosInstance.get(`${endpoints.products.shopOrders}`, {
    params: {
      ...params,
      shop_id: shopId,
    },
  });
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
