import { supabase } from './supabase';

/**
 * Server-side route handlers that live in this app (app/api/...).
 *
 * Anything that must not be computed or authorised in the browser — pricing,
 * booking creation, Razorpay orders and payment verification — goes through
 * here rather than straight to Supabase.
 */
const API_URL = '/api';

async function callBackendAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Backend request failed' }));
      throw new Error(err.error || `Backend error: ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.error(`Backend API call failed for ${endpoint}:`, err.message);
    throw err;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
};

function parseQuery(endpoint: string): { table: string; params: Record<string, string> } {
  const [path, queryString] = endpoint.split('?');
  const params: Record<string, string> = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((v, k) => { params[k] = v; });
  }
  return { table: path.replace(/^\/+/, ''), params };
}

function extractIdFromPath(endpoint: string): { basePath: string; id: string } | null {
  const parts = endpoint.replace(/^\/+/, '').split('/');
  if (parts.length >= 2 && parts[parts.length - 1]) {
    return { basePath: parts.slice(0, -1).join('/'), id: parts[parts.length - 1] };
  }
  return null;
}

async function sbQuery<T = any>(endpoint: string, method = 'GET', body?: any, _token?: string | null): Promise<T> {
  const { table, params } = parseQuery(endpoint);

  try {
    switch (table) {
      case 'cottages': {
        if (method !== 'GET') break;
        const { data, error } = await supabase.from('Cottage').select('*').order('sortOrder', { ascending: true });
        if (error) throw error;
        return { data } as T;
      }
      case 'cottages/slug': {
        if (method !== 'GET') break;
        const slug = params.slug || endpoint.split('/').pop();
        const { data, error } = await supabase.from('Cottage').select('*').eq('slug', slug).single();
        if (error) throw error;
        return { data } as T;
      }
      // Every Booking read goes through a route handler now.
      //
      // These used to run here, in the browser, with the anon key: the admin
      // and employee screens paged through every guest's name, email and phone
      // number from a table that anyone could query directly. The server
      // routes carry the session check and run under the service role, so the
      // table itself no longer has to be readable from the outside.
      //
      // Availability ignores PENDING bookings whose reservation hold has
      // lapsed — an abandoned checkout must not block the cottage — and that
      // rule now lives in the route rather than being duplicated per caller.
      case 'bookings/available-cottages':
      case 'bookings/availability':
      case 'bookings/calendar':
      case 'bookings/all': {
        if (method !== 'GET') break;
        const qs = new URLSearchParams(params).toString();
        return (await callBackendAPI(`/${table}${qs ? `?${qs}` : ''}`)) as T;
      }
      case 'cafe/menu': {
        if (method !== 'GET') break;
        const { data, error } = await supabase.from('CafeCategory').select('*, items:CafeItem(*)').eq('isActive', true).order('sortOrder');
        if (error) throw error;
        return { data } as T;
      }
      case 'cafe/kitchen': {
        if (method !== 'GET') break;
        const { data, error } = await supabase.from('CafeOrder').select('*, items:CafeOrderItem(*, item:CafeItem(*))').in('status', ['PENDING', 'PREPARING']).order('createdAt');
        if (error) throw error;
        return { data } as T;
      }
      case 'cafe/orders': {
        if (method === 'GET') {
          let query = supabase.from('CafeOrder').select('*, items:CafeOrderItem(*, item:CafeItem(*))').order('createdAt', { ascending: false });
          if (params.limit) query = query.limit(parseInt(params.limit));
          const { data, error } = await query;
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'cafe/categories': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('CafeCategory').select('*, items:CafeItem(*)').order('sortOrder');
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'cafe/analytics/daily': {
        if (method !== 'GET') break;
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase.from('CafeOrder').select('*').gte('createdAt', today).lt('createdAt', new Date(Date.now() + 86400000).toISOString().split('T')[0]);
        if (error) throw error;
        const totalRevenue = (data || []).reduce((s: number, o: any) => s + o.totalAmount, 0);
        const totalOrders = data?.length || 0;
        return { data: { orders: totalOrders, revenue: totalRevenue, averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0 } } as T;
      }
      case 'cafe/analytics/monthly': {
        if (method !== 'GET') break;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
        const { data, error } = await supabase.from('CafeOrder').select('*').gte('createdAt', monthStart).lte('createdAt', monthEnd);
        if (error) throw error;
        const totalRevenue = (data || []).reduce((s: number, o: any) => s + o.totalAmount, 0);
        return { data: { orders: data?.length || 0, revenue: totalRevenue } } as T;
      }
      case 'cafe/analytics/top-items': {
        if (method !== 'GET') break;
        const limit = parseInt(params.limit || '10');
        const { data: orderItems, error } = await supabase.from('CafeOrderItem').select('item:CafeItem(name), quantity, totalPrice').limit(200);
        if (error) throw error;
        const grouped: Record<string, { name: string; quantity: number; revenue: number }> = {};
        for (const oi of orderItems || []) {
          const name = (oi.item as any)?.name || 'Unknown';
          if (!grouped[name]) grouped[name] = { name, quantity: 0, revenue: 0 };
          grouped[name].quantity += oi.quantity;
          grouped[name].revenue += oi.totalPrice;
        }
        const top = Object.values(grouped).sort((a, b) => b.quantity - a.quantity).slice(0, limit);
        return { data: top } as T;
      }
      case 'cafe/analytics/sales-chart': {
        if (method !== 'GET') break;
        const days = parseInt(params.days || '7');
        const since = new Date(Date.now() - days * 86400000).toISOString();
        const { data, error } = await supabase.from('CafeOrder').select('createdAt,totalAmount').gte('createdAt', since).order('createdAt');
        if (error) throw error;
        const chartData: Record<string, number> = {};
        for (const o of data || []) {
          const day = o.createdAt.split('T')[0];
          chartData[day] = (chartData[day] || 0) + o.totalAmount;
        }
        return { data: Object.entries(chartData).map(([date, amount]) => ({ date, amount })) } as T;
      }
      case 'cms/dashboard': {
        // Counts over Booking, Guest and ContactMessage — the browser must not
        // hold those rows, so the arithmetic happens behind the admin session.
        return (await callBackendAPI('/admin/cms/dashboard')) as T;
      }
      case 'cms/settings': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('SiteSetting').select('*');
          if (error) throw error;
          const settings: Record<string, any> = {};
          (data || []).forEach((s: any) => { settings[s.key] = s.value; });
          return { data: settings } as T;
        }
        break;
      }
      case 'cms/cottages': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('Cottage').select('*').order('sortOrder');
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'cms/gallery': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('Gallery').select('*').order('sortOrder');
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'cms/testimonials': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('Testimonial').select('*').order('sortOrder');
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'cms/faqs': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('FAQ').select('*').order('sortOrder');
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'cms/faqs/public': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('FAQ').select('*').eq('isActive', true).order('sortOrder');
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'cms/messages': {
        // The inbox holds names, emails, phone numbers and message bodies.
        if (method !== 'GET') break;
        return (await callBackendAPI('/admin/cms/messages')) as T;
      }
      case 'cms/coupons': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('Coupon').select('*').order('createdAt', { ascending: false });
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'cms/coupons/active': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('Coupon').select('*').eq('isActive', true).order('createdAt', { ascending: false });
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'cms/coupons/validate': {
        if (method === 'POST') {
          const { code, amount } = body;
          const { data: coupon, error } = await supabase.from('Coupon').select('*').eq('code', code).eq('isActive', true).single();
          if (error || !coupon) throw new Error('Invalid coupon code');
          if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new Error('Coupon has expired');
          if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) throw new Error('Coupon usage limit reached');
          if (amount < coupon.minAmount) throw new Error(`Minimum order amount is ₹${coupon.minAmount}`);
          let discount = coupon.discountType === 'PERCENTAGE' ? (amount * coupon.discountValue) / 100 : coupon.discountValue;
          discount = Math.min(discount, amount);
          return { data: { discount, type: coupon.discountType, value: coupon.discountValue } } as T;
        }
        break;
      }
      case 'cms/staff': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('Staff').select('*').order('createdAt', { ascending: false });
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'cms/packages': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('Package').select('*').order('sortOrder');
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'packages/active': {
        if (method === 'GET') {
          const now = new Date().toISOString();
          const { data, error } = await supabase.from('Package').select('*').eq('isActive', true).order('sortOrder');
          if (error) throw error;
          const active = (data || []).filter((p: any) => {
            if (p.startDate && p.startDate > now) return false;
            if (p.endDate && p.endDate < now) return false;
            return true;
          });
          return { data: active } as T;
        }
        break;
      }
      case 'chat/conversations': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('ChatConversation').select('*').order('createdAt', { ascending: false });
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      default: break;
    }
  } catch (err: any) {
    throw new Error(err.message || 'Supabase query failed');
  }

  return {} as T;
}

async function sbMutation<T = any>(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', body?: any, _token?: string | null): Promise<T> {
  const parts = endpoint.replace(/^\/+/, '').split('/');

  try {
    if (method === 'POST' && endpoint === '/auth/login') {
      // Password hashes live in `User`; reading that table with the anon key
      // from the browser would put every hash in the bundle. The route handler
      // does the lookup and the bcrypt compare server side.
      return (await callBackendAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      })) as T;
    }

    if (method === 'POST' && endpoint === '/auth/refresh') {
      return { data: { success: true } } as T;
    }

    if (method === 'POST' && endpoint === '/auth/logout') {
      return { data: { success: true } } as T;
    }

    if (method === 'POST' && endpoint === '/contact') {
      // Written from the browser with the anon key until now, which kept
      // ContactMessage open to anyone. The form posts to the route instead.
      return (await callBackendAPI('/contact', {
        method: 'POST',
        body: JSON.stringify(body),
      })) as T;
    }

    if (method === 'POST' && parts[0] === 'chatbot' && parts[1] === 'chat') {
      return { data: { reply: 'Chatbot is temporarily unavailable. Please contact us at +91-91188-82242.' } } as T;
    }

    // Approve, reject, cancel and check-in/out all write to Booking, and all
    // of them used to run here in the browser: the admin screen passed a token
    // that nothing ever checked, so any visitor could POST
    // `/bookings/<id>/approve` and mark their own booking CONFIRMED and PAID
    // without paying. The writes happen on the server now, behind a verified
    // session, and the status route only accepts CHECKED_IN / CHECKED_OUT so it
    // can never be used to skip payment either.
    if (method === 'POST' && parts.length === 3 && parts[0] === 'bookings') {
      const res = await callBackendAPI(`/bookings/${parts[1]}/${parts[2]}`, {
        method: 'POST',
        body: JSON.stringify(body ?? {}),
      });
      return { data: res.data } as T;
    }

    if (method === 'PUT' && parts.length === 3 && parts[0] === 'bookings' && parts[2] === 'status') {
      const res = await callBackendAPI(`/bookings/${parts[1]}/status`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return { data: res.data } as T;
    }

    if (method === 'POST' && endpoint === '/bookings') {
      // Pricing, availability and the pricing snapshot are all decided by the
      // server. The browser only supplies stay and guest details.
      const res = await callBackendAPI('/bookings', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return { data: res.data } as T;
    }

    if (method === 'POST' && endpoint === '/bookings/lookup') {
      // Matching a reference against the guest's own contact detail happens
      // under the service role. The browser never queries Booking directly.
      const res = await callBackendAPI('/bookings/lookup', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return { data: res.data } as T;
    }

    if (method === 'POST' && endpoint === '/service-requests') {
      // Ownership of the booking is re-proved server side on every request.
      const res = await callBackendAPI('/service-requests', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return { data: res.data } as T;
    }

    if (method === 'POST' && endpoint === '/bookings/create-payment-order') {
      const res = await callBackendAPI('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ bookingId: body.bookingId }),
      });
      return { data: res.data } as T;
    }

    if (method === 'POST' && endpoint === '/bookings/confirm-payment') {
      // Confirmation is signature-verified server side; the browser can no
      // longer mark a booking as paid.
      const res = await callBackendAPI('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: body.bookingId,
          razorpayOrderId: body.razorpayOrderId,
          razorpayPaymentId: body.razorpayPaymentId,
          razorpaySignature: body.razorpaySignature,
        }),
      });
      return { data: res.data } as T;
    }

    if (method === 'POST' && endpoint === '/cafe/orders') {
      const orderRef = 'CF' + Date.now().toString(36).toUpperCase();
      const items = body.items || [];
      let totalAmount = 0;
      for (const item of items) {
        totalAmount += item.unitPrice * item.quantity;
      }
      const { data: order, error: orderError } = await supabase.from('CafeOrder').insert({ orderRef, tableNumber: body.tableNumber, guestName: body.guestName, notes: body.notes, totalAmount, status: 'PENDING', paymentStatus: body.paymentStatus || 'PENDING' }).select().single();
      if (orderError) throw orderError;
      if (items.length > 0) {
        const orderItems = items.map((item: any) => ({ orderId: order.id, itemId: item.itemId, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.unitPrice * item.quantity, notes: item.notes || null }));
        await supabase.from('CafeOrderItem').insert(orderItems);
      }
      return { data: order } as T;
    }

    if (method === 'PUT' && endpoint.match(/\/cafe\/orders\/[^/]+\/status/)) {
      const id = parts[2];
      const { data, error } = await supabase.from('CafeOrder').update({ status: body.status }).eq('id', id).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint === '/cafe/categories') {
      const { data, error } = await supabase.from('CafeCategory').insert(body).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint === '/cafe/items') {
      const { data, error } = await supabase.from('CafeItem').insert(body).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/cms/cottages') && parts.length === 2) {
      const { data, error } = await supabase.from('Cottage').insert(body).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/cms/gallery') && parts.length === 2) {
      const { data, error } = await supabase.from('Gallery').insert(body).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/cms/testimonials') && parts.length === 2) {
      const { data, error } = await supabase.from('Testimonial').insert(body).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/cms/faqs') && parts.length === 2) {
      const { data, error } = await supabase.from('FAQ').insert(body).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/cms/coupons') && parts.length === 2) {
      const { data, error } = await supabase.from('Coupon').insert(body).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/cms/staff') && parts.length === 2) {
      const { data, error } = await supabase.from('Staff').insert(body).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/cms/packages') && parts.length === 2) {
      const { data, error } = await supabase.from('Package').insert(body).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/cms/staff/') && parts[3] === 'fire') {
      const { data, error } = await supabase.from('Staff').update({ status: 'FIRED', firedAt: new Date().toISOString() }).eq('id', parts[2]).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/cms/staff/') && parts[3] === 'hire') {
      const { data, error } = await supabase.from('Staff').update({ status: 'ACTIVE', firedAt: null }).eq('id', parts[2]).select().single();
      if (error) throw error;
      return { data } as T;
    }

    // Contact-message handling used to fall through to the generic
    // update/delete below, which wrote with the anon key. Both now go through
    // the admin route so `ContactMessage` can be closed to the browser.
    if (method === 'PUT' && parts[0] === 'cms' && parts[1] === 'messages' && parts[3] === 'read') {
      return (await callBackendAPI(`/admin/cms/messages/${parts[2]}/read`, {
        method: 'PUT',
        body: '{}',
      })) as T;
    }

    if (method === 'DELETE' && ((parts[0] === 'contact') || (parts[0] === 'cms' && parts[1] === 'messages'))) {
      const id = parts[parts.length - 1];
      return (await callBackendAPI(`/admin/cms/messages/${id}`, { method: 'DELETE' })) as T;
    }

    if (method === 'PUT') {
      const tableName = getTableNameFromEndpoint(parts);
      if (tableName) {
        const id = parts[parts.length - 1];
        const { data, error } = await supabase.from(tableName).update(body).eq('id', id).select().single();
        if (error) throw error;
        return { data } as T;
      }
    }

    if (method === 'DELETE') {
      const tableName = getTableNameFromEndpoint(parts);
      if (tableName) {
        const id = parts[parts.length - 1];
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) throw error;
        return { data: { success: true } } as T;
      }
    }
  } catch (err: any) {
    throw new Error(err.message || 'Supabase mutation failed');
  }

  return {} as T;
}

/**
 * Which table a generic CMS write belongs to.
 *
 * `ContactMessage` is deliberately absent: its reads and writes are handled by
 * the admin route above, because it holds guest contact details. Nothing that
 * reaches this function may name a table holding personal data.
 */
function getTableNameFromEndpoint(parts: string[]): string | null {
  if (parts[0] !== 'cms') return null;
  const mapping: Record<string, string> = {
    'cottages': 'Cottage',
    'gallery': 'Gallery',
    'testimonials': 'Testimonial',
    'faqs': 'FAQ',
    'coupons': 'Coupon',
    'staff': 'Staff',
    'packages': 'Package',
    'items': 'CafeItem',
    'categories': 'CafeCategory',
    'orders': 'CafeOrder',
  };
  return mapping[parts[1]] || null;
}

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  if (method === 'GET') {
    return sbQuery<T>(endpoint, method, undefined, token);
  }
  return sbMutation<T>(endpoint, method as 'POST' | 'PUT' | 'DELETE', body, token);
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
    /**
     * Fetch one booking by its reference, verified against the email or phone
     * it was booked with. There is deliberately no way to list every booking
     * for a contact detail: knowing someone's email must not reveal their stays.
     */
    lookup: (reference: string, contact: string) =>
      api.post('/bookings/lookup', { reference, contact }),
    list: (token: string | null) => api.get('/bookings/all', token),
    cancel: (id: string, token: string | null) => api.post(`/bookings/${id}/cancel`, {}, token),
  },
  serviceRequests: {
    /**
     * Raise a housekeeping or maintenance request. The booking reference and
     * contact detail go with it because the route verifies ownership itself
     * rather than trusting an earlier lookup.
     */
    create: (payload: {
      reference: string;
      contact: string;
      category: string;
      priority: string;
      subject: string;
      description: string;
      preferredTime?: string | null;
    }) => api.post('/service-requests', payload),
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
      return supabase.storage.from('uploads').upload(`${Date.now()}`, formData).then(({ data, error }) => {
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data?.path || '');
        return { url: urlData.publicUrl, publicId: data?.path };
      });
    },
    delete: (publicId: string, token: string | null) => {
      return supabase.storage.from('uploads').remove([publicId]).then(({ error }) => {
        if (error) throw error;
        return { success: true };
      });
    },
  },
  chatbot: {
    chat: (message: string, history?: any[]) => api.post('/chatbot/chat', { message, history }),
  },
};
