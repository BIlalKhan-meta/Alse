import axiosInstance from '.';
import endpoints from './endpoints';

export const GetSubscriptions = () => {
  console.log(axiosInstance.get(`${endpoints.subscription.getSubscription}`));
  return axiosInstance.get(`${endpoints.subscription.getSubscription}`);
};

export const GetSubscriptionsLogs = () => {
  console.log(axiosInstance.get(`${endpoints.subscription.getSubscription}`));
  return axiosInstance.get(`${endpoints.subscription.getSubscriptionLogs}`);
};

export const makePayment = (formData: FormData) => {
  console.log('body, id body, idbody, idbody, idbody, id ==>', formData);

  return axiosInstance.post(endpoints.subscription.subscribe, formData, {
    formData: true,
  });
};
