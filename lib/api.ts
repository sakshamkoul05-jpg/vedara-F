const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vedara-b-production.up.railway.app/api';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
};

function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const contentType = response.headers.get('content-type') || '';
  let data: any;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { error: text || 'API request failed' };
  }

  if (!response.ok) {
    throw new Error((data as any)?.error || 'API request failed');
  }

  return data as T;
}

export const api = {
  get: <T = any>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { token: token || undefined }),

  post: <T = any>(endpoint: string, body?: any, token?: string | null) =>
    request<T>(endpoint, { method: 'POST', body, token: token || undefined }),

  put: <T = any>(endpoint: string, body?: any, token?: string | null) =>
    request<T>(endpoint, { method: 'PUT', body, token: token || undefined }),

  delete: <T = any>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: 'DELETE', token: token || undefined }),
};

export const endpoints = {
  cottages: {
    list: () => api.get('/cottages'),
    bySlug: (slug: string) => api.get(`/cottages/slug/${slug}`),
    byId: (id: string) => api.get(`/cottages/${id}`),
  },
  bookings: {
    checkAvailability: (cottageId: string, checkIn: string, checkOut: string) =>
      api.get(`/bookings/availability?cottageId=${cottageId}&checkIn=${checkIn}&checkOut=${checkOut}`),
    availableCottages: (checkIn: string, checkOut: string) =>
      api.get(`/bookings/available-cottages?checkIn=${checkIn}&checkOut=${checkOut}`),
    create: (data: any) => api.post('/bookings', data),
    confirmPayment: (data: any) => api.post('/bookings/confirm-payment', data),
    calendar: (cottageId: string, month: number, year: number) =>
      api.get(`/bookings/calendar?cottageId=${cottageId}&month=${month}&year=${year}`),
    myBookings: (phone?: string, email?: string) => {
      const params = new URLSearchParams();
      if (phone) params.set('phone', phone);
      if (email) params.set('email', email);
      return api.get(`/bookings/my-bookings?${params.toString()}`);
    },
    list: (token: string | null) => api.get('/bookings/all', token),
    cancel: (id: string, token: string | null) => api.post(`/bookings/${id}/cancel`, {}, token),
  },
  payments: {
    createOrder: (data: any) => api.post('/payments/create-order', data),
    verify: (data: any) => api.post('/payments/verify', data),
  },
  cafe: {
    menu: (staff = false) => api.get(`/cafe/menu${staff ? '?staff=true' : ''}`),
    staffMenu: () => api.get('/cafe/menu?staff=true'),
    createOrder: (data: any) => api.post('/cafe/orders', data),
    orders: (token: string | null) => api.get('/cafe/orders', token),
    kitchenOrders: (token: string | null) => api.get('/cafe/kitchen', token),
    updateOrderStatus: (id: string, status: string, token: string | null) =>
      api.put(`/cafe/orders/${id}/status`, { status }, token),
    categories: (token: string | null) => api.get('/cafe/categories', token),
    addCategory: (data: any, token: string | null) => api.post('/cafe/categories', data, token),
    addItem: (data: any, token: string | null) => api.post('/cafe/items', data, token),
    updateItem: (id: string, data: any, token: string | null) =>
      api.put(`/cafe/items/${id}`, data, token),
    analytics: {
      daily: (token: string | null) => api.get('/cafe/analytics/daily', token),
      monthly: (token: string | null) => api.get('/cafe/analytics/monthly', token),
      topItems: (token: string | null, limit = 10) => api.get(`/cafe/analytics/top-items?limit=${limit}`, token),
      salesChart: (token: string | null, days = 7) => api.get(`/cafe/analytics/sales-chart?days=${days}`, token),
    },
  },
  auth: {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    refresh: () => api.post('/auth/refresh'),
    logout: (token: string | null) => api.post('/auth/logout', {}, token),
    profile: (token: string | null) => api.get('/auth/profile', token),
    users: (token: string | null) => api.get('/auth/users', token),
    createUser: (data: any, token: string | null) => api.post('/auth/users', data, token),
    updateUser: (id: string, data: any, token: string | null) =>
      api.put(`/auth/users/${id}`, data, token),
  },
  cms: {
    dashboard: (token: string | null) => api.get('/cms/dashboard', token),
    settings: (token: string | null) => api.get('/cms/settings', token),
    updateSetting: (data: any, token: string | null) => api.put('/cms/settings', data, token),
    cottages: (token: string | null) => api.get('/cms/cottages', token),
    createCottage: (data: any, token: string | null) => api.post('/cms/cottages', data, token),
    updateCottage: (id: string, data: any, token: string | null) =>
      api.put(`/cms/cottages/${id}`, data, token),
    deleteCottage: (id: string, token: string | null) => api.delete(`/cms/cottages/${id}`, token),
    gallery: (token: string | null) => api.get('/cms/gallery', token),
    addGalleryItem: (data: any, token: string | null) => api.post('/cms/gallery', data, token),
    deleteGalleryItem: (id: string, token: string | null) => api.delete(`/cms/gallery/${id}`, token),
    testimonials: (token: string | null) => api.get('/cms/testimonials', token),
    createTestimonial: (data: any, token: string | null) => api.post('/cms/testimonials', data, token),
    faqs: (token: string | null) => api.get('/cms/faqs', token),
    createFAQ: (data: any, token: string | null) => api.post('/cms/faqs', data, token),
    messages: (token: string | null) => api.get('/cms/messages', token),
    markMessageRead: (id: string, token: string | null) =>
      api.put(`/cms/messages/${id}/read`, {}, token),
    coupons: (token: string | null) => api.get('/cms/coupons', token),
    createCoupon: (data: any, token: string | null) => api.post('/cms/coupons', data, token),
    updateCoupon: (id: string, data: any, token: string | null) => api.put(`/cms/coupons/${id}`, data, token),
    deleteCoupon: (id: string, token: string | null) => api.delete(`/cms/coupons/${id}`, token),
    validateCoupon: (code: string, amount: number, token?: string | null) =>
      api.post('/cms/coupons/validate', { code, amount }, token),
    activityLogs: (token: string | null) => api.get('/cms/activity-logs', token),
    users: (token: string | null) => api.get('/cms/users', token),
    getStaff: (token: string | null) => api.get('/cms/staff', token),
    createStaff: (data: any, token: string | null) => api.post('/cms/staff', data, token),
    updateStaff: (id: string, data: any, token: string | null) => api.put(`/cms/staff/${id}`, data, token),
    fireStaff: (id: string, token: string | null) => api.post(`/cms/staff/${id}/fire`, {}, token),
    hireStaff: (id: string, token: string | null) => api.post(`/cms/staff/${id}/hire`, {}, token),
    deleteStaff: (id: string, token: string | null) => api.delete(`/cms/staff/${id}`, token),
    getPackages: (token: string | null) => api.get('/cms/packages', token),
    createPackage: (data: any, token: string | null) => api.post('/cms/packages', data, token),
    updatePackage: (id: string, data: any, token: string | null) => api.put(`/cms/packages/${id}`, data, token),
    deletePackage: (id: string, token: string | null) => api.delete(`/cms/packages/${id}`, token),
    activePackages: () => api.get('/packages/active', null),
  },
  contact: {
    submit: (data: any) => api.post('/contact', data),
  },
  upload: {
    image: (formData: FormData, token: string | null) => {
      return fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` },
        body: formData,
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Upload failed');
        return data;
      });
    },
    delete: (publicId: string, token: string | null) =>
      api.delete(`/upload/${publicId}`, token),
  },
  chatbot: {
    chat: (message: string, history?: any[]) => api.post('/chatbot/chat', { message, history }),
  },
};
