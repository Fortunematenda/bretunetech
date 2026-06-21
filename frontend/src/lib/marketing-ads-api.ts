const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

export interface Benefit {
  text: string;
  icon: string;
}

export interface Pricing {
  currentPrice: string;
  oldPrice?: string;
  currency: string;
  showSpecial: boolean;
  showDiscount: boolean;
}

export interface Branding {
  showLogo: boolean;
  showWebsite: boolean;
  showPhone: boolean;
  showFacebook: boolean;
  showLinkedIn: boolean;
  websiteUrl?: string;
  phoneNumber?: string;
  facebookUrl?: string;
  linkedInUrl?: string;
}

export interface ProductInfo {
  productId?: string;
  productName: string;
  productImage?: string;
  price?: string;
  salePrice?: string;
  brand?: string;
  description?: string;
}

export type TemplateType = 'powder_splash' | 'neon_tech' | 'modern_gradient' | 'premium_showcase' | 'hero_banner';
export type ExportFormat = 'facebook_post' | 'facebook_cover' | 'instagram_post' | 'instagram_story' | 'website_hero' | 'whatsapp_promo';

export interface MarketingAd {
  id: string;
  title: string;
  template: TemplateType;
  product: ProductInfo;
  headline: string;
  subheading?: string;
  benefits?: Benefit[];
  pricing?: Pricing;
  branding?: Branding;
  exportFormat: ExportFormat;
  generatedImageUrl?: string;
  generatedThumbnailUrl?: string;
  downloadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingAdsResponse {
  ads: MarketingAd[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MarketingCopySuggestions {
  headlines: string[];
  subheadings: string[];
  benefits: Benefit[];
  ctas: string[];
}

export interface MarketingAdsStats {
  totalAds: number;
  mostDownloaded: MarketingAd | null;
  mostUsedTemplate: TemplateType | null;
  recentAds: MarketingAd[];
}

// API Functions
export async function listMarketingAds(params?: {
  page?: number;
  limit?: number;
  template?: TemplateType;
  isActive?: boolean;
  search?: string;
}): Promise<MarketingAdsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.template) queryParams.append('template', params.template);
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(`${API_BASE}/marketing-ads?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch marketing ads');
  return response.json();
}

export async function getMarketingAdById(id: string): Promise<MarketingAd> {
  const response = await fetch(`${API_BASE}/marketing-ads/${id}`);
  if (!response.ok) throw new Error('Failed to fetch marketing ad');
  return response.json();
}

export async function createMarketingAd(data: Partial<MarketingAd>): Promise<MarketingAd> {
  const response = await fetch(`${API_BASE}/marketing-ads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('Create marketing ad error:', errorData);
    throw new Error(errorData.error || 'Failed to create marketing ad');
  }
  return response.json();
}

export async function updateMarketingAd(id: string, data: Partial<MarketingAd>): Promise<MarketingAd> {
  const response = await fetch(`${API_BASE}/marketing-ads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update marketing ad');
  return response.json();
}

export async function deleteMarketingAd(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/marketing-ads/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete marketing ad');
  return response.json();
}

export async function duplicateMarketingAd(id: string): Promise<MarketingAd> {
  const response = await fetch(`${API_BASE}/marketing-ads/${id}/duplicate`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to duplicate marketing ad');
  return response.json();
}

export async function incrementDownloadCount(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/marketing-ads/${id}/download`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to increment download count');
  return response.json();
}

export async function getMarketingAdsStats(): Promise<MarketingAdsStats> {
  const response = await fetch(`${API_BASE}/marketing-ads/statistics`);
  if (!response.ok) throw new Error('Failed to fetch marketing ads statistics');
  return response.json();
}

export async function generateMarketingCopy(data: {
  productName: string;
  productDescription?: string;
  price?: string;
  category?: string;
}): Promise<MarketingCopySuggestions> {
  const response = await fetch(`${API_BASE}/marketing-ads/generate-copy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to generate marketing copy');
  return response.json();
}

export async function uploadMarketingAdImage(file: File): Promise<{ url: string }> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/marketing-ads/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('Upload marketing ad image error:', errorData);
    throw new Error(errorData.error || 'Failed to upload image');
  }

  return response.json();
}
