import axiosInstance from '.';
import endpoints from './endpoints';

// Search result types based on API documentation
export interface SearchUser {
  id: number;
  username?: string;
  full_name: string;
  email: string;
  dialing_code?: string;
  phone_number?: string;
  gender?: string;
  dob?: string;
  avatar?: string;
  cover_photo?: string;
  age?: number;
  is_child: number;
  is_active: number;
  is_approved: number;
  is_private: number;
  has_subscription: number;
  is_following: boolean;
  is_follow_requested: boolean;
}

export interface SearchAuction {
  id: number;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  end_time: string;
  status: string;
  seller: {
    id: number;
    name: string;
  };
}

export interface SearchProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  brand_name?: string;
  category: {
    id: number;
    name: string;
  };
  shop: {
    id: number;
    name: string;
  };
}

export interface SearchShop {
  id: number;
  name: string;
  description?: string;
  logo?: string;
}

export interface SearchArticle {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author: {
    id: number;
    name: string;
  };
}

export interface SearchBlog {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author: {
    id: number;
    name: string;
  };
}

export interface SearchVideo {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  category: string;
  created_at: string;
  author: {
    id: number;
    name: string;
  };
}

export interface SearchChat {
  id: number;
  name: string;
  type: 'private' | 'group';
  last_message?: string;
  last_message_time?: string;
  participants_count?: number;
}

// Search parameters interfaces
export interface UserSearchParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface AuctionSearchParams {
  search?: string;
  status?: string;
  category?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  ending_soon?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface ProductSearchParams {
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  shop_id?: number;
  sort?: string;
  per_page?: number;
  page?: number;
}

export interface ShopSearchParams {
  search?: string;
  page?: number;
}

export interface ArticleSearchParams {
  search?: string;
  page?: number;
}

export interface BlogSearchParams {
  search?: string;
  page?: number;
}

export interface VideoSearchParams {
  search?: string;
  category?: string;
  page?: number;
}

export interface ChatSearchParams {
  search?: string;
  type?: 'private' | 'group';
}

export interface ShopProductsSearchParams {
  search?: string;
  status?: number;
  from?: string;
  to?: string;
  per_page?: number;
}

// API response types
export interface SearchResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page?: number;
    from?: number;
    to?: number;
  };
}

// Search API functions
export const searchAPI = {
  // Search users
  searchUsers: (params: UserSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return axiosInstance.get<SearchResponse<SearchUser>>(
      `${endpoints.search.users}?${queryParams.toString()}`,
    );
  },

  // Search auctions
  searchAuctions: (params: AuctionSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return axiosInstance.get<SearchResponse<SearchAuction>>(
      `${endpoints.search.auctions}?${queryParams.toString()}`,
    );
  },

  // Search products
  searchProducts: (params: ProductSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return axiosInstance.get<SearchResponse<SearchProduct>>(
      `${endpoints.search.products}?${queryParams.toString()}`,
    );
  },

  // Search shops
  searchShops: (params: ShopSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return axiosInstance.get<SearchResponse<SearchShop>>(
      `${endpoints.search.shops}?${queryParams.toString()}`,
    );
  },

  // Search articles
  searchArticles: (params: ArticleSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return axiosInstance.get<SearchResponse<SearchArticle>>(
      `${endpoints.search.articles}?${queryParams.toString()}`,
    );
  },

  // Search user articles
  searchUserArticles: (params: ArticleSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return axiosInstance.get<SearchResponse<SearchArticle>>(
      `${endpoints.search.userArticles}?${queryParams.toString()}`,
    );
  },

  // Search blogs
  searchBlogs: (params: BlogSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return axiosInstance.get<SearchResponse<SearchBlog>>(
      `${endpoints.search.blogs}?${queryParams.toString()}`,
    );
  },

  // Search user blogs
  searchUserBlogs: (params: BlogSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return axiosInstance.get<SearchResponse<SearchBlog>>(
      `${endpoints.search.userBlogs}?${queryParams.toString()}`,
    );
  },

  // Search videos
  searchVideos: (params: VideoSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return axiosInstance.get<SearchResponse<SearchVideo>>(
      `${endpoints.search.videos}?${queryParams.toString()}`,
    );
  },

  // Search user videos
  searchUserVideos: (params: VideoSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return axiosInstance.get<SearchResponse<SearchVideo>>(
      `${endpoints.search.userVideos}?${queryParams.toString()}`,
    );
  },

  // Search chats
  searchChats: (params: ChatSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return axiosInstance.get<SearchResponse<SearchChat>>(
      `${endpoints.search.chats}?${queryParams.toString()}`,
    );
  },

  // Search shop products
  searchShopProducts: (
    shopId: number,
    params: ShopProductsSearchParams = {},
  ) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = endpoints.search.shopProducts.replace(
      '{shop_id}',
      shopId.toString(),
    );
    return axiosInstance.get<SearchResponse<SearchProduct>>(
      `${endpoint}?${queryParams.toString()}`,
    );
  },
};

export default searchAPI;
