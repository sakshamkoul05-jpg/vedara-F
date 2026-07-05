import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature' },
        { status: 400 },
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 },
      );
    }

    const expectedSignature = createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment signature verification failed', verified: false },
        { status: 400 },
      );
    }

    return NextResponse.json({
      verified: true,
      razorpay_order_id,
      razorpay_payment_id,
    });
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 },
    );
  }
}
