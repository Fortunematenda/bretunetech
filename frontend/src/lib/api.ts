// Use localhost:4000 for development, relative path for production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

// Token refresh helper
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const authData = localStorage.getItem('bretunetech-auth');
    if (!authData) return null;
    const parsed = JSON.parse(authData);
    const refreshToken = parsed?.state?.refreshToken;
    if (!refreshToken) return null;

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;
    const data = await res.json();

    // Update stored tokens
    parsed.state.token = data.token;
    parsed.state.refreshToken = data.refreshToken;
    localStorage.setItem('bretunetech-auth', JSON.stringify(parsed));

    return data.token;
  } catch {
    return null;
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  let res = await fetch(url, {
    headers,
    cache: 'no-store',
    ...rest,
  });

  // Auto-refresh on 401
  if (res.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefreshToken();
    }
    const newToken = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${endpoint}`, { headers, ...rest });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    // Format validation errors if present
    let message: string;
    if (error.errors && Object.keys(error.errors).length > 0) {
      const details = Object.entries(error.errors)
        .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
        .join('; ');
      message = `${error.error} (${details})`;
    } else {
      message = error.error || error.message || `HTTP ${res.status}`;
    }
    // Attach the HTTP status so callers can distinguish a real auth failure (401)
    // from transient errors (429/5xx) and avoid wiping a valid session.
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return res.json();
}

// Auth
export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    fetchApi<{ requiresVerification: boolean; email: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  resendOtp: (email: string) =>
    fetchApi<{ message: string }>('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtp: (data: { email: string; otp: string }) =>
    fetchApi<{ user: any; token: string; refreshToken: string }>('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    fetchApi<{ user: any; token: string; refreshToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: (token: string) =>
    fetchApi<any>('/auth/me', { token }),
  updateProfile: (token: string, data: any) =>
    fetchApi<any>('/auth/me', { method: 'PUT', token, body: JSON.stringify(data) }),
  createAdmin: (token: string, data: any) =>
    fetchApi<any>('/auth/admin', { method: 'POST', token, body: JSON.stringify(data) }),
  getAdminUsers: (token: string) =>
    fetchApi<any[]>('/auth/admin', { token }),
  deleteAdminUser: (token: string, id: string) =>
    fetchApi<any>(`/auth/admin/${id}`, { method: 'DELETE', token }),
  updateAdminUser: (token: string, id: string, data: any) =>
    fetchApi<any>(`/auth/admin/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),
  getPermissions: (token: string) =>
    fetchApi<any[]>('/permissions', { token }),
  getPermissionsByCategory: (token: string) =>
    fetchApi<Record<string, any[]>>('/permissions/by-category', { token }),
  getRolePermissions: (token: string, role: string) =>
    fetchApi<any[]>(`/permissions/role/${role}`, { token }),
  assignPermission: (token: string, data: any) =>
    fetchApi<any>('/permissions/assign', { method: 'POST', token, body: JSON.stringify(data) }),
  removePermission: (token: string, data: any) =>
    fetchApi<any>('/permissions/remove', { method: 'POST', token, body: JSON.stringify(data) }),
};

// Custom Roles
export const customRolesApi = {
  getCustomRoles: (token: string) =>
    fetchApi<any[]>('/custom-roles', { token }),
  getCustomRole: (token: string, id: string) =>
    fetchApi<any>(`/custom-roles/${id}`, { token }),
  createCustomRole: (token: string, data: any) =>
    fetchApi<any>('/custom-roles', { method: 'POST', token, body: JSON.stringify(data) }),
  updateCustomRole: (token: string, id: string, data: any) =>
    fetchApi<any>(`/custom-roles/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),
  deleteCustomRole: (token: string, id: string) =>
    fetchApi<any>(`/custom-roles/${id}`, { method: 'DELETE', token }),
  getCustomRolePermissions: (token: string, id: string) =>
    fetchApi<any[]>(`/custom-roles/${id}/permissions`, { token }),
  assignPermissionToCustomRole: (token: string, data: any) =>
    fetchApi<any>('/custom-roles/assign-permission', { method: 'POST', token, body: JSON.stringify(data) }),
  removePermissionFromCustomRole: (token: string, data: any) =>
    fetchApi<any>('/custom-roles/remove-permission', { method: 'POST', token, body: JSON.stringify(data) }),
  assignCustomRoleToUser: (token: string, userId: string, customRoleId: string) =>
    fetchApi<any>(`/custom-roles/assign-to-user/${userId}`, { method: 'POST', token, body: JSON.stringify({ customRoleId }) }),
  removeCustomRoleFromUser: (token: string, userId: string) =>
    fetchApi<any>(`/custom-roles/remove-from-user/${userId}`, { method: 'POST', token }),
};

// Products
export const productsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ products: any[]; pagination: any }>(`/products${query}`);
  },
  getBySlug: (slug: string) => fetchApi<any>(`/products/${slug}`),
  getById: (token: string, id: string) => fetchApi<any>(`/products/admin/${id}`, { token }),
  create: (token: string, data: any) =>
    fetchApi<any>('/products', { method: 'POST', token, body: JSON.stringify(data) }),
  update: (token: string, id: string, data: any) =>
    fetchApi<any>(`/products/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),
  delete: (token: string, id: string) =>
    fetchApi<any>(`/products/${id}`, { method: 'DELETE', token }),
  deleteByCategory: (token: string, categorySlug: string) =>
    fetchApi<any>(`/products/bulk/category/${categorySlug}`, { method: 'DELETE', token }),
  export: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/products/export${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then((res) => {
      if (!res.ok) throw new Error('Export failed');
      return res.blob();
    });
  },
};

// Brands
export const brandsApi = {
  list: () => fetchApi<any[]>('/brands'),
  create: (token: string, data: any) =>
    fetchApi<any>('/brands', { method: 'POST', token, body: JSON.stringify(data) }),
  update: (token: string, id: string, data: any) =>
    fetchApi<any>(`/brands/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),
  delete: (token: string, id: string) =>
    fetchApi<any>(`/brands/${id}`, { method: 'DELETE', token }),
  getProducts: (token: string, id: string) =>
    fetchApi<any[]>(`/brands/${id}/products`, { token }),
};

// Categories
export const categoriesApi = {
  list: () => fetchApi<any[]>('/categories'),
  getBySlug: (slug: string) => fetchApi<any>(`/categories/${slug}`),
  create: (token: string, data: any) =>
    fetchApi<any>('/categories', { method: 'POST', token, body: JSON.stringify(data) }),
  update: (token: string, id: string, data: any) =>
    fetchApi<any>(`/categories/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),
  delete: (token: string, id: string) =>
    fetchApi<any>(`/categories/${id}`, { method: 'DELETE', token }),
};

// Bundles
export const bundlesApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any[]>(`/bundles${query}`);
  },
  getBySlug: (slug: string) => fetchApi<any>(`/bundles/${slug}`),
  create: (token: string, data: any) =>
    fetchApi<any>('/bundles', { method: 'POST', token, body: JSON.stringify(data) }),
  update: (token: string, id: string, data: any) =>
    fetchApi<any>(`/bundles/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),
};

// Cart
export const cartApi = {
  get: (token: string) => fetchApi<any>('/cart', { token }),
  addItem: (token: string, data: { productId?: string; bundleId?: string; quantity?: number; warehouseLocation?: string }) =>
    fetchApi<any>('/cart/items', { method: 'POST', token, body: JSON.stringify(data) }),
  updateItem: (token: string, itemId: string, quantity: number) =>
    fetchApi<any>(`/cart/items/${itemId}`, { method: 'PUT', token, body: JSON.stringify({ quantity }) }),
  removeItem: (token: string, itemId: string) =>
    fetchApi<any>(`/cart/items/${itemId}`, { method: 'DELETE', token }),
  clear: (token: string) =>
    fetchApi<any>('/cart', { method: 'DELETE', token }),
};

// Orders
export const ordersApi = {
  create: (token: string, data: { addressId?: string; paymentMethod?: string; notes?: string }) =>
    fetchApi<any>('/orders', { method: 'POST', token, body: JSON.stringify(data) }),
  list: (token: string) => fetchApi<any[]>('/orders', { token }),
  getById: (token: string, id: string) => fetchApi<any>(`/orders/${id}`, { token }),
  getWhatsApp: (token: string, id: string) => fetchApi<any>(`/orders/${id}/whatsapp`, { token }),
};

// Addresses
export const addressesApi = {
  list: (token: string) => fetchApi<any[]>('/addresses', { token }),
  create: (token: string, data: any) =>
    fetchApi<any>('/addresses', { method: 'POST', token, body: JSON.stringify(data) }),
  update: (token: string, id: string, data: any) =>
    fetchApi<any>(`/addresses/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),
  delete: (token: string, id: string) =>
    fetchApi<any>(`/addresses/${id}`, { method: 'DELETE', token }),
};

// Admin
export const adminApi = {
  getStats: (token: string) => fetchApi<any>('/admin/stats', { token }),
  getOrders: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ orders: any[]; pagination: any }>(`/admin/orders${query}`, { token });
  },
  getOrderById: (token: string, id: string) =>
    fetchApi<any>(`/admin/orders/${id}`, { token }),
  getShippingSettings: (token: string) => fetchApi<{ standardFee: number; freeShippingThreshold: number; enableFreeShipping: boolean }>('/admin/shipping', { token }),
  updateShippingSettings: (token: string, settings: { standardFee: number; freeShippingThreshold: number; enableFreeShipping: boolean }) => 
    fetchApi<any>('/admin/shipping', { token, method: 'PUT', body: JSON.stringify(settings) }),
  getBusinessSettings: (token: string) => fetchApi<any>('/admin/business', { token }),
  updateBusinessSettings: (token: string, settings: any) => 
    fetchApi<any>('/admin/business', { token, method: 'PUT', body: JSON.stringify(settings) }),
  getCustomers: (token: string) => fetchApi<any[]>('/admin/customers', { token }),
  getCustomer: (token: string, id: string) => fetchApi<any>(`/admin/customers/${id}`, { token }),
  deleteCustomer: (token: string, id: string) =>
    fetchApi<any>(`/admin/customers/${id}`, { method: 'DELETE', token }),
  updateOrderStatus: (token: string, id: string, status: string) =>
    fetchApi<any>(`/admin/orders/${id}/status`, { method: 'PUT', token, body: JSON.stringify({ status }) }),
  deleteOrder: (token: string, id: string) =>
    fetchApi<any>(`/admin/orders/${id}`, { method: 'DELETE', token }),
  getInventory: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any[]>(`/admin/inventory${query}`, { token });
  },
  getBestSellers: (token: string) => fetchApi<any[]>('/admin/analytics/best-sellers', { token }),
  getEnquiries: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ enquiries: any[]; pagination: any }>(`/admin/enquiries${query}`, { token });
  },
  updateEnquiry: (token: string, id: string, data: { status?: string; notes?: string }) =>
    fetchApi<any>(`/admin/enquiries/${id}`, { method: 'PATCH', token, body: JSON.stringify(data) }),
  replyEnquiry: (token: string, id: string, data: { subject: string; message: string }) =>
    fetchApi<any>(`/admin/enquiries/${id}/reply`, { method: 'POST', token, body: JSON.stringify(data) }),
  upsertSetting: (token: string, data: { key: string; value: string; group?: string; description?: string; isPublic?: boolean }) =>
    fetchApi<any>('/settings', { token, method: 'POST', body: JSON.stringify(data) }),
  getSetting: (token: string, key: string) =>
    fetchApi<any>(`/settings/${key}`, { token }),
};

// Analytics
export const analyticsApi = {
  getSummary: (token: string) => fetchApi<any>('/analytics/summary', { token }),
  getTopPages: (token: string, days?: number) => fetchApi<any[]>(`/analytics/top-pages?days=${days || 7}`, { token }),
  getTopProducts: (token: string, days?: number) => fetchApi<any[]>(`/analytics/top-products?days=${days || 7}`, { token }),
  getTrafficSources: (token: string, days?: number) => fetchApi<any[]>(`/analytics/traffic-sources?days=${days || 7}`, { token }),
  getDeviceBreakdown: (token: string, days?: number) => fetchApi<any[]>(`/analytics/device-breakdown?days=${days || 7}`, { token }),
  getVisitorsOverTime: (token: string, days?: number) => fetchApi<any[]>(`/analytics/visitors-over-time?days=${days || 30}`, { token }),
  getBrowsers: (token: string, days?: number) => fetchApi<any[]>(`/analytics/browsers?days=${days || 7}`, { token }),
  getProductAnalytics: (token: string, productId: string) => fetchApi<any>(`/analytics/product/${productId}`, { token }),
  getCustomerSummary: (token: string) => fetchApi<any>('/analytics/customers/summary', { token }),
  getRecentCustomers: (token: string, limit?: number) => fetchApi<any[]>(`/analytics/customers/recent?limit=${limit || 10}`, { token }),
  // Detailed endpoints
  getVisitorsList: (token: string, days?: number) => fetchApi<any[]>(`/analytics/visitors-list?days=${days || 1}`, { token }),
  getHourlyVisitors: (token: string) => fetchApi<any[]>('/analytics/hourly', { token }),
  getDetailedPageViews: (token: string, days?: number) => fetchApi<any[]>(`/analytics/detailed-page-views?days=${days || 7}`, { token }),
  getDetailedProductViews: (token: string, days?: number) => fetchApi<any[]>(`/analytics/detailed-product-views?days=${days || 7}`, { token }),
  getUniqueVisitorsDetail: (token: string, days?: number) => fetchApi<any[]>(`/analytics/unique-visitors-detail?days=${days || 7}`, { token }),
  getNewVsReturning: (token: string, days?: number) => fetchApi<any>(`/analytics/new-vs-returning?days=${days || 7}`, { token }),
  getWeeklyBreakdown: (token: string) => fetchApi<any>('/analytics/weekly-breakdown', { token }),
  getLiveVisitors: (token: string) => fetchApi<any>('/analytics/live', { token }),
  getNewCustomersDetailed: (token: string, days?: number) => fetchApi<any[]>(`/analytics/customers/new-detailed?days=${days || 1}`, { token }),
  getCustomerRegistrations: (token: string, days?: number) => fetchApi<any[]>(`/analytics/customers/registrations?days=${days || 30}`, { token }),
};

// Bookings (public + admin)
export const bookingsApi = {
  create: (data: any) =>
    fetchApi<any>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  list: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ bookings: any[]; pagination: any }>(`/bookings${query}`, { token });
  },
  getById: (token: string, id: string) =>
    fetchApi<any>(`/bookings/${id}`, { token }),
  update: (token: string, id: string, data: any) =>
    fetchApi<any>(`/bookings/${id}`, { method: 'PATCH', token, body: JSON.stringify(data) }),
  delete: (token: string, id: string) =>
    fetchApi<any>(`/bookings/${id}`, { method: 'DELETE', token }),
  reply: (token: string, id: string, data: { subject: string; message: string }) =>
    fetchApi<any>(`/bookings/${id}/reply`, { method: 'POST', token, body: JSON.stringify(data) }),
};

// Invoices (admin)
export const invoicesApi = {
  list: (token: string) => fetchApi<any[]>('/admin/invoices', { token }),
  create: (token: string, data: any) =>
    fetchApi<any>('/admin/invoices', { method: 'POST', token, body: JSON.stringify(data) }),
  update: (token: string, id: string, data: any) =>
    fetchApi<any>(`/admin/invoices/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),
  delete: (token: string, id: string) =>
    fetchApi<any>(`/admin/invoices/${id}`, { method: 'DELETE', token }),
};

// Product Import (admin)
export const importApi = {
  getSettings: (token: string) => fetchApi<any>('/import/settings', { token }),
  updateSettings: (token: string, data: { globalMarkup: number }) =>
    fetchApi<any>('/import/settings', { method: 'PATCH', token, body: JSON.stringify(data) }),
  importSingle: (token: string, data: {
    name: string;
    description: string;
    category: string;
    supplierName?: string;
    supplierSku?: string;
    costPrice: number;
    markupPercentage?: number;
    imageUrl?: string;
    condition?: 'NEW' | 'REFURBISHED';
    stockQuantity?: number;
    tags?: string[];
  }) => fetchApi<any>('/import/single', { method: 'POST', token, body: JSON.stringify(data) }),
  previewCsv: async (token: string, file: File, globalMarkup?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (typeof globalMarkup === 'number') {
      formData.append('globalMarkup', String(globalMarkup));
    }

    const res = await fetch(`${API_URL}/import/csv/preview`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  },
  importCsv: async (
    token: string,
    file: File,
    settings?: { globalMarkup?: number; skipDuplicates?: boolean; uploadImages?: boolean }
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (settings?.globalMarkup !== undefined) {
      formData.append('globalMarkup', String(settings.globalMarkup));
    }
    if (settings?.skipDuplicates !== undefined) {
      formData.append('skipDuplicates', String(settings.skipDuplicates));
    }
    if (settings?.uploadImages !== undefined) {
      formData.append('uploadImages', String(settings.uploadImages));
    }

    const res = await fetch(`${API_URL}/import/csv`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  },
  previewCsvMapped: async (token: string, file: File, columnMap: Record<string, string>, globalMarkup?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('columnMap', JSON.stringify(columnMap));
    if (typeof globalMarkup === 'number') formData.append('globalMarkup', String(globalMarkup));

    const res = await fetch(`${API_URL}/import/csv/preview-mapped`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
  importCsvMapped: async (
    token: string,
    file: File,
    columnMap: Record<string, string>,
    settings?: { globalMarkup?: number; skipDuplicates?: boolean; uploadImages?: boolean; addVatToCost?: boolean; vatRate?: number; defaultCategory?: string; defaultSupplierName?: string }
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('columnMap', JSON.stringify(columnMap));
    if (settings?.globalMarkup !== undefined) formData.append('globalMarkup', String(settings.globalMarkup));
    if (settings?.skipDuplicates !== undefined) formData.append('skipDuplicates', String(settings.skipDuplicates));
    if (settings?.uploadImages !== undefined) formData.append('uploadImages', String(settings.uploadImages));
    if (settings?.addVatToCost !== undefined) formData.append('addVatToCost', String(settings.addVatToCost));
    if (settings?.vatRate !== undefined) formData.append('vatRate', String(settings.vatRate));
    if (settings?.defaultCategory) formData.append('defaultCategory', settings.defaultCategory);
    if (settings?.defaultSupplierName) formData.append('defaultSupplierName', settings.defaultSupplierName);

    const res = await fetch(`${API_URL}/import/csv/mapped`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
  importRows: async (
    token: string,
    rows: any[],
    settings?: { globalMarkup?: number; skipDuplicates?: boolean; uploadImages?: boolean; addVatToCost?: boolean; vatRate?: number }
  ) => {
    const res = await fetch(`${API_URL}/import/rows`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, ...settings }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
  downloadTemplate: async (token: string) => {
    const res = await fetch(`${API_URL}/import/template`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.blob();
  },
};

export const notificationsApi = {
  getNotifications: (token: string, options?: { unreadOnly?: boolean; limit?: number }) => {
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.set('unreadOnly', 'true');
    if (options?.limit) params.set('limit', String(options.limit));
    const queryString = params.toString();
    return fetchApi<any[]>(`/notifications${queryString ? `?${queryString}` : ''}`, { token });
  },
  getUnreadCount: (token: string) => fetchApi<{ count: number }>('/notifications/unread-count', { token }),
  markAsRead: (token: string, id: string) => fetchApi<any>(`/notifications/${id}/read`, { method: 'PATCH', token }),
  markAllAsRead: (token: string) => fetchApi<any>('/notifications/read-all', { method: 'PATCH', token }),
  deleteNotification: (token: string, id: string) => fetchApi<any>(`/notifications/${id}`, { method: 'DELETE', token }),
  clearAll: (token: string) => fetchApi<any>('/notifications', { method: 'DELETE', token }),
};

// Suppliers
export const suppliersApi = {
  list: (active?: boolean) => {
    const query = active !== undefined ? `?active=${active}` : '';
    return fetchApi<any[]>(`/suppliers${query}`);
  },
  getById: (token: string, id: string) => fetchApi<any>(`/suppliers/${id}`, { token }),
  create: (token: string, data: any) =>
    fetchApi<any>('/suppliers', { method: 'POST', token, body: JSON.stringify(data) }),
  update: (token: string, id: string, data: any) =>
    fetchApi<any>(`/suppliers/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),
  delete: (token: string, id: string) =>
    fetchApi<any>(`/suppliers/${id}`, { method: 'DELETE', token }),
};

// Returns
export const returnsApi = {
  // Customer
  create: (token: string, data: any) =>
    fetchApi<any>('/returns', { method: 'POST', token, body: JSON.stringify(data) }),
  list: (token: string) => fetchApi<any[]>('/returns', { token }),
  getById: (token: string, id: string) => fetchApi<any>(`/returns/${id}`, { token }),
  // Admin
  adminList: (token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any[]>(`/returns/admin/all${query}`, { token });
  },
  adminGetById: (token: string, id: string) => fetchApi<any>(`/returns/admin/${id}`, { token }),
  adminUpdateStatus: (token: string, id: string, data: { status: string; note?: string; adminNote?: string; customerVisibleNote?: string }) =>
    fetchApi<any>(`/returns/admin/${id}/status`, { method: 'PUT', token, body: JSON.stringify(data) }),
  adminAddNote: (token: string, id: string, data: { adminNote?: string; customerVisibleNote?: string }) =>
    fetchApi<any>(`/returns/admin/${id}/note`, { method: 'PUT', token, body: JSON.stringify(data) }),
};

// SEO
export const seoApi = {
  getProductScores: (token: string) => fetchApi<any>('/seo/products/score', { token }),
  generateAll: (token: string, overwrite: boolean = false) => fetchApi<any>('/seo/generate-all', { method: 'POST', token, body: JSON.stringify({ overwrite }) }),
  assignBrands: (token: string) => fetchApi<any>('/seo/assign-brands', { method: 'POST', token, body: JSON.stringify({}) }),
  getHealth: (token: string) => fetchApi<any>('/seo/health', { token }),
  getProductSeo: (productId: string) => fetchApi<any>(`/seo/product/${productId}`),
  extractSpecs: (token: string, opts: { onlyWithoutSpecs: boolean; replace: boolean; removeFromAdditionalInfo: boolean }) =>
    fetchApi<any>('/seo/extract-specs', { method: 'POST', token, body: JSON.stringify(opts) }),
};

// Public (no auth required)
export const publicApi = {
  getShippingSettings: () => fetchApi<{ standardFee: number; freeShippingThreshold: number; enableFreeShipping: boolean }>('/shipping-settings'),
  getAnnouncements: () => fetchApi<Array<{ icon: string; text: string }>>('/announcements'),
};
