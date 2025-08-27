import {baseURL} from '../utils/baseurl';

// Auction types based on the API documentation
export interface Auction {
  id: number;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  minimum_next_bid: number;
  reserve_price?: number;
  buy_now_price?: number;
  status: 'draft' | 'active' | 'paused' | 'ended' | 'cancelled';
  time_remaining: number;
  can_be_bid_on: boolean;
  category: string;
  location: string;
  duration_days: number;
  auto_extend: boolean;
  auto_extend_minutes: number;
  product_images: string[];
  seller: {
    id: number;
    username: string;
    full_name: string;
  };
  created_at: string;
  end_time: string;
}

export interface Bid {
  id: number;
  auction_id: number;
  amount: number;
  status: 'active' | 'cancelled' | 'won';
  is_auto_bid: boolean;
  max_amount?: number;
  user: {
    id: number;
    username: string;
  };
  created_at: string;
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

// Auction API endpoints
export const auctionAPI = {
  // Get all auctions with filters
  getAuctions: async (params?: {
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
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(
      `${baseURL}/api/auctions?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get specific auction
  getAuction: async (auctionId: number) => {
    const response = await fetch(`${baseURL}/api/auctions/${auctionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Create new auction
  createAuction: async (auctionData: CreateAuctionRequest, token: string) => {
    const response = await fetch(`${baseURL}/api/auctions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(auctionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Place bid
  placeBid: async (bidData: PlaceBidRequest, token: string) => {
    const response = await fetch(`${baseURL}/api/bids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bidData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get bids for an auction
  getAuctionBids: async (auctionId: number) => {
    const response = await fetch(`${baseURL}/api/bids/auction/${auctionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get user's bids
  getUserBids: async (token: string) => {
    const response = await fetch(`${baseURL}/api/bids/my/bids`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get user's winning bids
  getUserWinningBids: async (token: string) => {
    const response = await fetch(`${baseURL}/api/bids/my/winning`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Cancel bid
  cancelBid: async (bidId: number, token: string) => {
    const response = await fetch(`${baseURL}/api/bids/${bidId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
