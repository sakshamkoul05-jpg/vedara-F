import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-jwt-secret'
);

const TOKEN_EXPIRY = '7d';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Fetch user from Supabase
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate real JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY)
      .sign(JWT_SECRET);

    // Return user data and token (exclude password hash)
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      user: {
        id: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
        role: safeUser.role,
        phone: safeUser.phone,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
