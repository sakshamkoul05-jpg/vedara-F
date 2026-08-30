import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vedara-backend-production.up.railway.app/api';

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
      case 'bookings/available-cottages': {
        if (method !== 'GET') break;
        const { data, error } = await supabase.from('Cottage').select('*').eq('isActive', true).order('sortOrder', { ascending: true });
        if (error) throw error;
        const checkIn = params.checkIn;
        const checkOut = params.checkOut;
        if (checkIn && checkOut) {
          let blockedIds = new Set<string>();
          let bookedIds = new Set<string>();
          const { data: blocked, error: blockedErr } = await supabase.from('BlockedDate').select('cottageId').gte('date', checkIn).lte('date', checkOut);
          if (!blockedErr && blocked) {
            blockedIds = new Set(blocked.map((b: any) => b.cottageId));
          }
          const { data: booked, error: bookedErr } = await supabase.from('Booking').select('cottageId').in('status', ['CONFIRMED', 'RESERVED', 'CHECKED_IN', 'PENDING']).lt('checkIn', checkOut).gt('checkOut', checkIn);
          if (!bookedErr && booked) {
            bookedIds = new Set(booked.map((b: any) => b.cottageId));
          }
          const allBlocked = new Set([...blockedIds, ...bookedIds]);
          return { data: (data || []).map((c: any) => ({ ...c, isAvailable: !allBlocked.has(c.id) })) } as T;
        }
        return { data: (data || []).map((c: any) => ({ ...c, isAvailable: true })) } as T;
      }
      case 'bookings/availability': {
        if (method !== 'GET') break;
        const cottageId = params.cottageId;
        const checkIn = params.checkIn;
        const checkOut = params.checkOut;
        const { data: blocked } = await supabase.from('BlockedDate').select('date').eq('cottageId', cottageId).gte('date', checkIn).lte('date', checkOut);
        const { data: booked } = await supabase.from('Booking').select('id').eq('cottageId', cottageId).in('status', ['CONFIRMED', 'RESERVED', 'CHECKED_IN', 'PENDING']).lt('checkIn', checkOut).gt('checkOut', checkIn);
        const available = (!blocked || blocked.length === 0) && (!booked || booked.length === 0);
        return { data: { available } } as T;
      }
      case 'bookings/calendar': {
        if (method !== 'GET') break;
        const cottageId = params.cottageId;
        const month = parseInt(params.month || '1');
        const year = parseInt(params.year || '2026');
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        const endMonth = month === 12 ? 1 : month + 1;
        const endYear = month === 12 ? year + 1 : year;
        const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
        const { data: blocked } = await supabase.from('BlockedDate').select('date,reason').eq('cottageId', cottageId).gte('date', start).lt('date', end);
        const { data: booked } = await supabase.from('Booking').select('checkIn,checkOut,status').eq('cottageId', cottageId).in('status', ['CONFIRMED', 'RESERVED', 'CHECKED_IN', 'PENDING']).lt('checkIn', end).gt('checkOut', start);
        return { data: { blockedDates: blocked || [], bookings: booked || [] } } as T;
      }
      case 'bookings/my-bookings': {
        if (method !== 'GET') break;
        let query = supabase.from('Booking').select('*, cottage:Cottage(*), guest:Guest(*)');
        if (params.phone) query = query.eq('guest.phone', params.phone);
        if (params.email) query = query.eq('guest.email', params.email);
        const { data, error } = await query.order('createdAt', { ascending: false });
        if (error) throw error;
        return { data } as T;
      }
      case 'bookings/all': {
        let query = supabase.from('Booking').select('*, cottage:Cottage(*), guest:Guest(*)', { count: 'exact' });
        if (params.status) query = query.eq('status', params.status);
        if (params.search) {
          const s = params.search;
          query = query.or(`guest.name.ilike.%${s}%,guest.email.ilike.%${s}%,guest.phone.ilike.%${s}%,bookingRef.ilike.%${s}%`);
        }
        const page = parseInt(params.page || '1');
        const limit = parseInt(params.limit || '20');
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to).order('createdAt', { ascending: false });
        const { data, error, count } = await query;
        if (error) throw error;
        return { data, total: count } as T;
      }
      case 'bookings': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('Booking').select('*, cottage:Cottage(*), guest:Guest(*)').order('createdAt', { ascending: false });
          if (error) throw error;
          return { data } as T;
        }
        break;
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
        const [bookingsRes, cottagesRes, cafeRes, messagesRes, guestsRes] = await Promise.all([
          supabase.from('Booking').select('id,createdAt,totalAmount,status'),
          supabase.from('Cottage').select('id,isActive'),
          supabase.from('CafeOrder').select('id,createdAt'),
          supabase.from('ContactMessage').select('id,isRead'),
          supabase.from('Guest').select('id'),
        ]);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const allBookings = bookingsRes.data || [];
        const monthlyBookings = allBookings.filter((b: any) => b.createdAt >= monthStart);
        const pendingBookings = allBookings.filter((b: any) => b.status === 'PENDING');
        const todayOrders = (cafeRes.data || []).filter((o: any) => o.createdAt >= new Date().toISOString().split('T')[0]);
        const unread = (messagesRes.data || []).filter((m: any) => !m.isRead);
        const cotts = cottagesRes.data || [];
        return { data: { totalBookings: allBookings.length, monthlyBookings: monthlyBookings.length, yearlyRevenue: allBookings.reduce((s: number, b: any) => s + (b.totalAmount || 0), 0), totalCottages: cotts.length, activeCottages: cotts.filter((c: any) => c.isActive).length, pendingBookings: pendingBookings.length, totalCafeOrders: (cafeRes.data || []).length, todayCafeOrders: todayOrders.length, unreadMessages: unread.length, totalGuests: (guestsRes.data || []).length } } as T;
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
        if (method === 'GET') {
          const { data, error } = await supabase.from('ContactMessage').select('*').order('createdAt', { ascending: false });
          if (error) throw error;
          return { data } as T;
        }
        break;
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
      case 'cms/activity-logs': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('ActivityLog').select('*, user:User(name,email)').order('createdAt', { ascending: false }).limit(100);
          if (error) throw error;
          return { data } as T;
        }
        break;
      }
      case 'cms/users': {
        if (method === 'GET') {
          const { data, error } = await supabase.from('User').select('id,name,email,role,phone,isActive,createdAt');
          if (error) throw error;
          return { data } as T;
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
      const { email, password } = body;
      const { data: user, error: userError } = await supabase.from('User').select('*').eq('email', email).single();
      if (userError || !user) throw new Error('Invalid credentials');
      return { data: { user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }, token: 'supabase-session' } } as T;
    }

    if (method === 'POST' && endpoint === '/auth/refresh') {
      return { data: { success: true } } as T;
    }

    if (method === 'POST' && endpoint === '/auth/logout') {
      return { data: { success: true } } as T;
    }

    if (method === 'POST' && endpoint === '/contact') {
      const { data, error } = await supabase.from('ContactMessage').insert(body).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && parts[0] === 'chatbot' && parts[1] === 'chat') {
      return { data: { reply: 'Chatbot is temporarily unavailable. Please contact us at +91-91188-82242.' } } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/bookings') && endpoint.includes('/cancel')) {
      const id = parts[1];
      const { data, error } = await supabase.from('Booking').update({ status: 'CANCELLED', cancelledAt: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/bookings') && endpoint.includes('/approve')) {
      const id = parts[1];
      const { data, error } = await supabase.from('Booking').update({ status: 'CONFIRMED', paymentStatus: 'PAID' }).eq('id', id).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint.startsWith('/bookings') && endpoint.includes('/reject')) {
      const id = parts[1];
      const { data, error } = await supabase.from('Booking').update({ status: 'CANCELLED', cancelReason: 'Rejected by admin' }).eq('id', id).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'PUT' && endpoint.startsWith('/bookings') && parts.length === 3 && parts[2] === 'status') {
      const id = parts[1];
      const { data, error } = await supabase.from('Booking').update({ status: body.status }).eq('id', id).select().single();
      if (error) throw error;
      return { data } as T;
    }

    if (method === 'POST' && endpoint === '/bookings') {
      const bookingRef = 'VD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
      let guestId = body.guestId;
      if (!guestId && body.guestPhone) {
        let { data: existingGuest } = await supabase.from('Guest').select('id').eq('phone', body.guestPhone).single();
        if (!existingGuest) {
          const { data: newGuest } = await supabase.from('Guest').insert({
            name: body.guestName,
            email: body.guestEmail || null,
            phone: body.guestPhone,
            address: body.address || null,
            idProof: body.idProof || null,
          }).select('id').single();
          guestId = newGuest?.id;
        } else {
          guestId = existingGuest.id;
          if (body.address || body.idProof) {
            await supabase.from('Guest').update({
              ...(body.address ? { address: body.address } : {}),
              ...(body.idProof ? { idProof: body.idProof } : {}),
            }).eq('id', guestId);
          }
        }
      } else if (!guestId && body.guest) {
        let { data: existingGuest } = await supabase.from('Guest').select('id').eq('phone', body.guest.phone).single();
        if (!existingGuest) {
          const { data: newGuest } = await supabase.from('Guest').insert(body.guest).select('id').single();
          guestId = newGuest?.id;
        } else {
          guestId = existingGuest.id;
        }
      }
      const bookingData = {
        bookingRef,
        guestId,
        cottageId: body.cottageId,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        adults: body.adults || 2,
        children: body.children || 0,
        totalAmount: body.totalAmount,
        finalAmount: body.finalAmount || body.totalAmount,
        discount: body.discount || 0,
        couponCode: body.couponCode || null,
        specialRequests: body.specialRequests || null,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        source: body.source || 'WEBSITE',
      };
      const { data: bookingRecord, error } = await supabase.from('Booking').insert(bookingData).select('*, cottage:Cottage(*), guest:Guest(*)').single();
      if (error) throw error;

      let razorpayOrder = null;
      try {
        const orderRes = await callBackendAPI('/payments/create-order', {
          method: 'POST',
          body: JSON.stringify({ amount: bookingRecord.finalAmount || bookingRecord.totalAmount, currency: 'INR', receipt: bookingRef }),
        });
        razorpayOrder = orderRes.data || orderRes;
      } catch (payErr: any) {
        console.warn('Razorpay order creation failed, payment will be handled later:', payErr.message);
      }

      return { data: { booking: bookingRecord, razorpayOrder } } as T;
    }

    if (method === 'POST' && endpoint === '/bookings/confirm-payment') {
      const { bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature, paymentId: pid, orderId: oid, amount } = body;
      const paymentIdVal = razorpayPaymentId || pid;
      const orderIdVal = razorpayOrderId || oid;
      await supabase.from('Booking').update({ paymentStatus: 'PAID', paymentId: paymentIdVal, status: 'CONFIRMED' }).eq('id', bookingId);
      await supabase.from('Payment').insert({ bookingId, paymentId: paymentIdVal, orderId: orderIdVal, amount: amount || 0, status: 'PAID', gateway: 'RAZORPAY' });
      return { data: { success: true } } as T;
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

    if (method === 'PUT') {
      const tableName = getTableNameFromEndpoint(parts);
      if (tableName) {
        const id = parts[parts.length - 1] === 'read' ? parts[parts.length - 2] : parts[parts.length - 1];
        const actualTable = parts[parts.length - 1] === 'read' ? 'ContactMessage' : tableName;
        const updateData = parts[parts.length - 1] === 'read' ? { isRead: true } : body;
        const { data, error } = await supabase.from(actualTable).update(updateData).eq('id', id).select().single();
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

function getTableNameFromEndpoint(parts: string[]): string | null {
  if (parts[0] === 'cms' || parts[0] === 'contact') {
    const mapping: Record<string, string> = {
      'cottages': 'Cottage',
      'gallery': 'Gallery',
      'testimonials': 'Testimonial',
      'faqs': 'FAQ',
      'messages': 'ContactMessage',
      'coupons': 'Coupon',
      'staff': 'Staff',
      'packages': 'Package',
      'items': 'CafeItem',
      'categories': 'CafeCategory',
      'orders': 'CafeOrder',
      'read': 'ContactMessage',
    };
    return mapping[parts[1]] || null;
  }
  if (parts[0] === 'contact') return 'ContactMessage';
  return null;
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
    myBookings: (phone?: string, email?: string) => {
      const params = new URLSearchParams();
      if (phone) params.set('phone', phone);
      if (email) params.set('email', email);
      return api.get(`/bookings/my-bookings?${params.toString()}`);
    },
    list: (token: string | null) => api.get('/bookings/all', token),
    cancel: (id: string, token: string | null) => api.post(`/bookings/${id}/cancel`, {}, token),
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
    users: (token: string | null) => api.get('/cms/users', token),
    createUser: (data: any, token: string | null) => api.post('/cms/users', data, token),
    updateUser: (id: string, data: any, token: string | null) =>
      api.put(`/cms/users/${id}`, data, token),
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
