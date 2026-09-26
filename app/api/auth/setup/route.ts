import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

const SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'vedara-setup-2026';

const ADMIN_EMAILS = [
  'vedararetreat@gmail.com',
  'admin@vedara.com',
  'manager@vedara.com',
  'cafe@vedara.com',
  'staff@vedara.com',
];

const NEW_PASSWORD = 'Admin@2026';

export async function POST(req: NextRequest) {
  try {
    const { setupKey } = await req.json();

    if (setupKey !== SETUP_KEY) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12);
    const results: string[] = [];

    for (const email of ADMIN_EMAILS) {
      const { data: existing } = await supabase
        .from('User')
        .select('id, email')
        .eq('email', email)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('User')
          .update({
            password: hashedPassword,
            isActive: true,
            lockoutUntil: null,
          })
          .eq('email', email);

        if (error) {
          results.push(`${email}: update failed - ${error.message}`);
        } else {
          results.push(`${email}: password updated to ${NEW_PASSWORD}`);
        }
      } else {
        const { error } = await supabase
          .from('User')
          .insert({
            email,
            password: hashedPassword,
            name: email === 'vedararetreat@gmail.com'
              ? 'Vedara Admin'
              : email === 'admin@vedara.com'
              ? 'Vedara Admin (alt)'
              : email === 'manager@vedara.com'
              ? 'Hotel Manager'
              : email === 'cafe@vedara.com'
              ? 'Cafe Staff'
              : 'Service Staff',
            role: email === 'vedararetreat@gmail.com' || email === 'admin@vedara.com'
              ? 'SUPER_ADMIN'
              : email === 'manager@vedara.com'
              ? 'MANAGER'
              : email === 'cafe@vedara.com'
              ? 'CAFE_STAFF'
              : 'RECEPTIONIST',
            isActive: true,
            phone: '+91-8091921222',
          });

        if (error) {
          results.push(`${email}: create failed - ${error.message}`);
        } else {
          results.push(`${email}: created with password ${NEW_PASSWORD}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin passwords reset complete',
      results,
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed. Please try again.' },
      { status: 500 }
    );
  }
}
