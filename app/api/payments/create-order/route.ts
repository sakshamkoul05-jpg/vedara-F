import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, receipt } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least 100 paise' },
        { status: 400 },
      );
    }

    const order = await razorpay.orders.create({
      amount,
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: body.notes || {},
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    });
  } catch (error: any) {
    console.error('Razorpay create-order failed:', error);
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Failed to create payment order' },
      { status },
    );
  }
}
