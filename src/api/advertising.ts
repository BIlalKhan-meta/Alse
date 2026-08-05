import axiosInstance from '.';

const AD_BASE = '/advertising';

export type AdEventPayload = {
  advertisement_id: number;
  reason?: string;
};

export type CampaignPayload = {
  title: string;
  description?: string;
  media_type?: 'image' | 'video' | 'carousel';
  media_url?: string;
  media_urls?: string[];
  destination_type?: 'product' | 'shop' | 'post' | 'url';
  destination_id?: number | null;
  destination_url?: string | null;
  cta_text?: string;
  campaign_type?:
    | 'store'
    | 'product'
    | 'discount'
    | 'event'
    | 'seasonal'
    | 'sponsored_post';
  priority?: number;
  budget: number;
  daily_budget?: number;
  start_date?: string;
  end_date?: string;
};

export type PromotionPayload = {
  title: string;
  description?: string;
  promotion_type: 'store' | 'product' | 'discount' | 'event' | 'seasonal';
  shop_id?: number;
  product_id?: number;
  advertisement_id?: number;
  media_type?: 'image' | 'video' | 'carousel';
  media_url?: string;
  media_urls?: string[];
  discount_percent?: number;
  starts_at?: string;
  ends_at?: string;
  status?: string;
};

// Consumer ad events
export const recordImpression = (advertisement_id: number) =>
  axiosInstance.post(`${AD_BASE}/impressions`, {advertisement_id});

export const recordClick = (advertisement_id: number) =>
  axiosInstance.post(`${AD_BASE}/clicks`, {advertisement_id});

export const hideAd = (advertisement_id: number) =>
  axiosInstance.post(`${AD_BASE}/hide`, {advertisement_id});

export const reportAd = (advertisement_id: number, reason?: string) =>
  axiosInstance.post(`${AD_BASE}/report`, {advertisement_id, reason});

export const notInterested = (advertisement_id: number) =>
  axiosInstance.post(`${AD_BASE}/not-interested`, {advertisement_id});

// Vendor campaigns
export const listCampaigns = (params?: {status?: string; per_page?: number}) =>
  axiosInstance.get(`${AD_BASE}/campaigns`, {params});

export const getCampaign = (id: number) =>
  axiosInstance.get(`${AD_BASE}/campaigns/${id}`);

export const createCampaign = (data: CampaignPayload) =>
  axiosInstance.post(`${AD_BASE}/campaigns`, data);

export const updateCampaign = (id: number, data: Partial<CampaignPayload>) =>
  axiosInstance.put(`${AD_BASE}/campaigns/${id}`, data);

export const submitCampaign = (id: number) =>
  axiosInstance.post(`${AD_BASE}/campaigns/${id}/submit`);

export const pauseCampaign = (id: number) =>
  axiosInstance.post(`${AD_BASE}/campaigns/${id}/pause`);

export const resumeCampaign = (id: number) =>
  axiosInstance.post(`${AD_BASE}/campaigns/${id}/resume`);

export const getCampaignStats = (id: number) =>
  axiosInstance.get(`${AD_BASE}/campaigns/${id}/stats`);

export const listPromotions = (params?: {per_page?: number}) =>
  axiosInstance.get(`${AD_BASE}/promotions`, {params});

export const createPromotion = (data: PromotionPayload) =>
  axiosInstance.post(`${AD_BASE}/promotions`, data);

export const promotionAnalytics = () =>
  axiosInstance.get(`${AD_BASE}/promotions/analytics`);
