import axiosInstance from '.';
import endpoints from './endpoints';

export interface BiddingSettings {
  default_increment_fixed: number;
  auto_bid_default_enabled: boolean;
  bid_confirmation_enabled: boolean;
}

export const updateBiddingSettings = (data: BiddingSettings) => {
  return axiosInstance.put(endpoints.bidding.settings, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getBiddingSettings = () => {
  return axiosInstance.get(endpoints.bidding.settings);
};
