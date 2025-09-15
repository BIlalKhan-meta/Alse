import axiosInstance from './index';

// Get available riders
export const getAvailableRiders = (params?: {
  search?: string;
  available?: boolean;
  per_page?: number;
}) => {
  const queryParams = new URLSearchParams();

  if (params?.search) {
    queryParams.append('search', params.search);
  }
  if (params?.available !== undefined) {
    queryParams.append('available', params.available.toString());
  }
  if (params?.per_page) {
    queryParams.append('per_page', params.per_page.toString());
  }

  const url = `/riders${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  console.log('API Call - URL:', url);
  console.log('API Call - Params:', params);

  return axiosInstance.get(url);
};

// Get rider statistics
export const getRiderStats = (riderId: number) => {
  return axiosInstance.get(`/riders/${riderId}/stats`);
};

// Assign rider to order
export const assignRiderToOrder = (orderId: number, riderId: number) => {
  return axiosInstance.post(`/orders/${orderId}/assign-rider`, {
    rider_id: riderId,
  });
};
