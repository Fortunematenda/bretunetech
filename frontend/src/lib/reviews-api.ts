const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ReviewStats {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function createReview(token: string, data: CreateReviewData): Promise<Review> {
  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create review');
  return res.json();
}

export async function getProductReviews(productId: string): Promise<{ reviews: Review[]; total: number; stats: ReviewStats }> {
  const res = await fetch(`${API_URL}/reviews/product/${productId}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function getProductReviewStats(productId: string): Promise<ReviewStats> {
  const res = await fetch(`${API_URL}/reviews/product/${productId}/stats`);
  if (!res.ok) throw new Error('Failed to fetch review stats');
  return res.json();
}

export async function listReviews(params?: { productId?: string; page?: number; limit?: number }): Promise<ReviewsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.productId) searchParams.append('productId', params.productId);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const query = searchParams.toString();
  const res = await fetch(`${API_URL}/reviews${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function updateReview(token: string, reviewId: string, data: Partial<CreateReviewData>): Promise<Review> {
  const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update review');
  return res.json();
}

export async function deleteReview(token: string, reviewId: string): Promise<void> {
  const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete review');
}
