import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Enquiry from the public contact form.
 *
 * This route existed but nothing ever called it — the form wrote the row from
 * the browser with the anon key instead, which meant `ContactMessage` had to
 * stay writable (and readable) by anyone holding the public key. The form now
 * posts here, and the write happens under the service role.
 *
 * No session: the sender is a guest. Validation is therefore strict, because
 * this is an unauthenticated path into the database.
 */
const submission = z.object({
  name: z.string().trim().min(2, 'Please tell us your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable()
    .or(z.literal('')),
  subject: z.string().trim().max(200).optional().nullable().or(z.literal('')),
  message: z.string().trim().min(5, 'Please write us a message.').max(5000),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = submission.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { success: false, error: first?.message ?? 'Some details are invalid.' },
      { status: 400 }
    );
  }

  const value = parsed.data;

  try {
    const { data, error } = await getServiceClient()
      .from('ContactMessage')
      .insert({
        name: value.name,
        email: value.email,
        phone: value.phone || null,
        subject: value.subject || null,
        message: value.message,
        isRead: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Contact submission failed:', error.message);
      return NextResponse.json(
        { success: false, error: 'We could not send your message. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { id: data.id } });
  } catch (err) {
    console.error('Contact submission failed:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: 'We could not send your message. Please try again.' },
      { status: 503 }
    );
  }
}
