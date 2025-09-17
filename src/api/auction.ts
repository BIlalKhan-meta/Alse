import axiosInstance from '.';
import endpoints from './endpoints';

// Auction types based on the actual API response
export interface Auction {
  id: number;
  title: string;
  description: string;
  starting_price: string; // API returns as string
  current_price?: number; // Not always present in API
  minimum_next_bid?: number; // Not always present in API
  reserve_price?: number | null;
  buy_now_price?: number | null;
  status: 'draft' | 'active' | 'paused' | 'ended' | 'cancelled';
  time_remaining?: number; // Calculated from end_time
  can_be_bid_on?: boolean; // Calculated based on status and time
  category: string;
  location?: string | null;
  duration_days: number;
  auto_extend: boolean;
  auto_extend_minutes: number;
  product_images?: string[] | null;
  shipping_info?: any | null;
  seller: {
    id: number;
    username?: string | null;
    full_name?: string | null;
    avatar?: string;
  };
  created_at: string;
  updated_at: string;
  start_time: string;
  end_time: string;
}

export interface Bid {
  id: number;
  auction_id: number;
  amount: string;
  is_auto_bid: boolean;
  max_amount?: string | null;
  status: 'active' | 'outbid' | 'won' | 'cancelled';
  placed_at: string;
  time_since_placed: string;
  bidder: {
    id: number | null;
    username: string | null;
    avatar: string | null;
  };
  auction: {
    id: number;
    title: string;
    current_price: string;
    status: string;
    end_time: string;
  };
  is_winning: boolean;
  is_outbid: boolean;
  is_won: boolean;
  is_cancelled: boolean;
  can_auto_bid: boolean;
  next_auto_bid_amount?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAuctionRequest {
  title: string;
  description: string;
  starting_price: number;
  reserve_price?: number;
  buy_now_price?: number;
  duration_days: number;
  auto_extend: boolean;
  auto_extend_minutes: number;
  category: string;
  location: string;
  shipping_info: {
    cost: number;
    method: string;
    delivery_time: string;
  };
  product_images: string[];
}

export interface PlaceBidRequest {
  auction_id: number;
  amount: number;
  is_auto_bid?: boolean;
  max_amount?: number;
}

// Auction API functions following the existing codebase pattern
export const getAuctions = (params?: {
    status?: string;
    category?: string;
    location?: string;
    min_price?: number;
    max_price?: number;
    ending_soon?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }) => {
  return axiosInstance.get(endpoints.search.auctions, {params});
};

export const getAuction = (auctionId: number) => {
  return axiosInstance.get(`${endpoints.search.auctions}/${auctionId}`);
};

export const createAuction = (auctionData: CreateAuctionRequest) => {
  console.log('🔧 API: createAuction function called');
  console.log('🔧 API: auctionData received:', JSON.stringify(auctionData, null, 2));
  
  const formData = new FormData();
  
  // Append basic fields
  formData.append('title', auctionData.title);
  formData.append('description', auctionData.description);
  formData.append('starting_price', auctionData.starting_price.toString());
  formData.append('duration_days', auctionData.duration_days.toString());
  formData.append('auto_extend', auctionData.auto_extend.toString());
  formData.append('auto_extend_minutes', auctionData.auto_extend_minutes.toString());
  formData.append('category', auctionData.category);
  formData.append('location', auctionData.location);
  
  // Append optional fields
  if (auctionData.reserve_price) {
    formData.append('reserve_price', auctionData.reserve_price.toString());
  }
  if (auctionData.buy_now_price) {
    formData.append('buy_now_price', auctionData.buy_now_price.toString());
  }
  
  // Append shipping info
  formData.append('shipping_cost', auctionData.shipping_info.cost.toString());
  formData.append('shipping_method', auctionData.shipping_info.method);
  formData.append('delivery_time', auctionData.shipping_info.delivery_time);
  
  // Append product images as strings (URLs)
  auctionData.product_images.forEach((image, index) => {
    formData.append(`product_images[${index}]`, image);
  });

  console.log('🔧 API: FormData prepared, making POST request to:', endpoints.search.auctions);
  console.log('🔧 API: Endpoint URL:', `${process.env.BASE_URL || 'BASE_URL'}${endpoints.search.auctions}`);
  
  return axiosInstance.post(endpoints.search.auctions, formData, {
    formData: true,
  });
};

// Alternative: Create auction through shop (if user has a shop)
export const createAuctionThroughShop = (shopId: number, auctionData: CreateAuctionRequest) => {
  const formData = new FormData();
  
  // Append basic fields
  formData.append('title', auctionData.title);
  formData.append('description', auctionData.description);
  formData.append('starting_price', auctionData.starting_price.toString());
  formData.append('duration_days', auctionData.duration_days.toString());
  formData.append('auto_extend', auctionData.auto_extend.toString());
  formData.append('auto_extend_minutes', auctionData.auto_extend_minutes.toString());
  formData.append('category', auctionData.category);
  formData.append('location', auctionData.location);
  
  // Append optional fields
  if (auctionData.reserve_price) {
    formData.append('reserve_price', auctionData.reserve_price.toString());
  }
  if (auctionData.buy_now_price) {
    formData.append('buy_now_price', auctionData.buy_now_price.toString());
  }
  
  // Append shipping info
  formData.append('shipping_cost', auctionData.shipping_info.cost.toString());
  formData.append('shipping_method', auctionData.shipping_info.method);
  formData.append('delivery_time', auctionData.shipping_info.delivery_time);
  
  // Append product images as strings (URLs)
  auctionData.product_images.forEach((image, index) => {
    formData.append(`product_images[${index}]`, image);
  });

  // Try creating auction through shop endpoint
  return axiosInstance.post(`${endpoints.shop.shopDetail}/${shopId}/auction/create`, formData, {
    formData: true,
  });
};

export const placeBid = (bidData: PlaceBidRequest) => {
  // Use JSON instead of FormData for proper boolean handling
  const requestData: any = {
    auction_id: bidData.auction_id,
    amount: bidData.amount,
    is_auto_bid: bidData.is_auto_bid || false,
  };

  // Add max_amount only if it's provided
  if (bidData.max_amount) {
    requestData.max_amount = bidData.max_amount;
  }

  return axiosInstance.post(endpoints.bidding.placeBid, requestData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getAuctionBids = (auctionId: number) => {
  return axiosInstance.get(`${endpoints.bidding.placeBid}/auction/${auctionId}`);
};

export const getUserBids = () => {
  return axiosInstance.get(`${endpoints.bidding.placeBid}/my/bids`);
};

export const getUserWinningBids = () => {
  return axiosInstance.get(`${endpoints.bidding.placeBid}/my/winning`);
};

export const cancelBid = (bidId: number) => {
  return axiosInstance.post(`${endpoints.bidding.placeBid}/${bidId}/cancel`);
};

// Additional API functions based on provided endpoints
export const getAllBidsForAuction = (auctionId: number) => {
  return axiosInstance.get(`${endpoints.bidding.placeBid}/auction/${auctionId}`);
};

export const getSpecificBidDetails = (bidId: number) => {
  return axiosInstance.get(`${endpoints.bidding.placeBid}/${bidId}`);
};

export const getMyBids = () => {
  return axiosInstance.get(`${endpoints.bidding.placeBid}/my/bids`);
};

export const getMyWinningBids = () => {
  return axiosInstance.get(`${endpoints.bidding.placeBid}/my/winning`);
};

export const getMyOutbidBids = () => {
  return axiosInstance.get(`${endpoints.bidding.placeBid}/my/outbid`);
};

export const getMyWonBids = () => {
  return axiosInstance.get(`${endpoints.bidding.placeBid}/my/won`);
};
