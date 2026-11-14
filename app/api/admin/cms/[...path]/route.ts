import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { getServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The four admin reads and writes that touch personal data.
 *
 * The dashboard counts, the message inbox, marking a message read and deleting
 * one all used to run in the browser against the anon key. That forced
 * `Booking`, `Guest`, `User` and `ContactMessage` to stay world-readable and
 * world-writable — anyone could page through every guest's details, or flip a
 * booking to PAID. They run here now, behind a verified admin session and the
 * service role, so those tables can be closed to the outside entirely.
 *
 * The path is an explicit allow-list rather than a table name: nothing not
 * named below can be reached through this route.
 */
type Params = { params: Promise<{ path: string[] }> };

const UNAUTHORISED = NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
const NOT_FOUND = NextResponse.json({ error: 'Not found.' }, { status: 404 });

/** The dashboard's numbers, computed from raw rows the browser must not see. */
async function dashboardStats() {
  const supabase = getServiceClient();
  const [bookingsRes, cottagesRes, cafeRes, messagesRes, guestsRes] = await Promise.all([
    supabase.from('Booking').select('id,createdAt,totalAmount,status'),
    supabase.from('Cottage').select('id,isActive'),
    supabase.from('CafeOrder').select('id,createdAt'),
    supabase.from('ContactMessage').select('id,isRead'),
    supabase.from('Guest').select('id'),
  ]);

  const failed = [bookingsRes, cottagesRes, cafeRes, messagesRes, guestsRes].find((r) => r.error);
  if (failed?.error) {
    console.error('Dashboard stats failed:', failed.error.message);
    return null;
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const today = now.toISOString().split('T')[0];

  const allBookings = bookingsRes.data ?? [];
  const allCottages = cottagesRes.data ?? [];
  const allOrders = cafeRes.data ?? [];
  const allMessages = messagesRes.data ?? [];
  const allGuests = guestsRes.data ?? [];

  return {
    totalBookings: allBookings.length,
    monthlyBookings: allBookings.filter((b: any) => b.createdAt >= monthStart).length,
    yearlyRevenue: allBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0),
    totalCottages: allCottages.length,
    activeCottages: allCottages.filter((c: any) => c.isActive).length,
    pendingBookings: allBookings.filter((b: any) => b.status === 'PENDING').length,
    totalCafeOrders: allOrders.length,
    todayCafeOrders: allOrders.filter((o: any) => o.createdAt >= today).length,
    unreadMessages: allMessages.filter((m: any) => !m.isRead).length,
    totalGuests: allGuests.length,
  };
}

export async function GET(_request: Request, { params }: Params) {
  if (!(await getAdminSession())) return UNAUTHORISED;

  const path = (await params).path;

  if (path.length === 1 && path[0] === 'dashboard') {
    const data = await dashboardStats();
    if (!data) return NextResponse.json({ error: 'Could not load the dashboard.' }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (path.length === 1 && path[0] === 'messages') {
    const { data, error } = await getServiceClient()
      .from('ContactMessage')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Message list failed:', error.message);
      return NextResponse.json({ error: 'Could not load messages.' }, { status: 500 });
    }
    return NextResponse.json({ data: data ?? [] });
  }

  return NOT_FOUND;
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await getAdminSession())) return UNAUTHORISED;

  const path = (await params).path;

  // PUT messages/<id>/read
  if (path.length === 3 && path[0] === 'messages' && path[2] === 'read') {
    const { data, error } = await getServiceClient()
      .from('ContactMessage')
      .update({ isRead: true })
      .eq('id', path[1])
      .select('id, isRead')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
      console.error('Mark message read failed:', error.message);
      return NextResponse.json({ error: 'Could not update the message.' }, { status: 500 });
    }
    return NextResponse.json({ data });
  }

  return NOT_FOUND;
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await getAdminSession())) return UNAUTHORISED;

  const path = (await params).path;

  // DELETE messages/<id>
  if (path.length === 2 && path[0] === 'messages') {
    const { data, error } = await getServiceClient()
      .from('ContactMessage')
      .delete()
      .eq('id', path[1])
      .select('id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
      console.error('Delete message failed:', error.message);
      return NextResponse.json({ error: 'Could not delete the message.' }, { status: 500 });
    }
    return NextResponse.json({ data });
  }

  return NOT_FOUND;
}
