import axiosInstance from '.';
import endpoints from './endpoints';

export interface BiddingSettings {
  default_increment_fixed: number;
  auto_bid_default_enabled: boolean;
  bid_confirmation_enabled: boolean;
}

export interface PlaceBidRequest {
  auction_id: number;
  amount: number;
  is_auto_bid?: boolean;
  max_amount?: number;
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

export const placeBid = (data: PlaceBidRequest) => {
  console.log('🔥 placeBid API called with:', data);
  console.log('🔥 Endpoint:', endpoints.bidding.placeBid);
  console.log(
    '🔥 Full URL will be:',
    `${axiosInstance.defaults.baseURL}${endpoints.bidding.placeBid}`,
  );
  console.log('🔥 Axios instance baseURL:', axiosInstance.defaults.baseURL);

  const request = axiosInstance.post(endpoints.bidding.placeBid, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('🔥 Request promise created:', request);
  return request;
};
