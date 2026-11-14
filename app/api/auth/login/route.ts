import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { getServiceClient } from '@/lib/supabase-server';

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

    // Read the user under the service role, never the anon key.
    //
    // `User` holds a bcrypt hash per row. Reading it with the anon key means
    // either the table has to be world-readable — putting every administrator's
    // password hash within reach of anyone who opens the network tab — or the
    // query silently returns nothing and no one can ever sign in.
    const supabase = getServiceClient();
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

    // A deactivated or locked-out account must not be able to sign in. These
    // columns were written by the admin screens but never read here, so
    // removing someone's access had no effect at all.
    if (user.isActive === false) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    if (user.lockoutUntil && new Date(user.lockoutUntil).getTime() > Date.now()) {
      return NextResponse.json({ error: 'This account is temporarily locked. Try again later.' }, { status: 423 });
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
