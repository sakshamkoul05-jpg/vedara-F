const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type RequestOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  token?: string;
};

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { token: token || undefined }),

  post: <T = any>(endpoint: string, body: any, token?: string | null) =>
    request<T>(endpoint, { method: 'POST', body, token: token || undefined }),

  put: <T = any>(endpoint: string, body: any, token?: string | null) =>
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
    myBookings: (phone?: string, email?: string) =>
      api.get(`/bookings/my-bookings?${phone ? `phone=${phone}` : ''}${email ? `email=${email}` : ''}`),
  },
  cafe: {
    menu: () => api.get('/cafe/menu'),
    createOrder: (data: any) => api.post('/cafe/orders', data),
  },
  contact: {
    submit: (data: any) => api.post('/contact', data),
  },
  auth: {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    profile: (token: string | null) => api.get('/auth/profile', token || undefined),
  },
  chatbot: {
    chat: (message: string, history?: any[]) => api.post('/chatbot/chat', { message, history }),
  },
};
