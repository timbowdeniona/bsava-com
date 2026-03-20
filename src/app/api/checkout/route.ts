import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/lib/store/useCart';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received Checkout Request Body:', JSON.stringify(body, null, 2));
    const { items }: { items: CartItem[] } = body;

    if (!items || items.length === 0) {
      console.warn('Checkout attempted with empty basket');
      return NextResponse.json({ error: 'No items in basket' }, { status: 400 });
    }

    // 1. Initial Line Items Mapping
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.title,
          description: item.description?.slice(0, 100) + '...',
          metadata: {
            id: item.id.toString(),
            type: item.productType,
          },
        },
        // We'll use memberPrice for this demo, or nonMemberPrice if available
        unit_amount: Math.round((item.nonMemberPrice || 0) * 100), // cents
      },
      quantity: item.quantity,
    }));

    // 2. Bundling Logic (Example: Book + Membership bundle)
    const hasBook = items.some(item => item.productType === 'Book');
    const hasMembership = items.some(item => item.productType === 'Membership');

    if (hasBook && hasMembership) {
      // Add a bundling discount as a negative line item
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Bundle Discount (Book + Membership)',
            description: '10% discount for purchasing a book with membership.',
          },
          unit_amount: -Math.round(items.reduce((acc, item) => {
             const price = item.nonMemberPrice || 0;
             return acc + (price * item.quantity);
          }, 0) * 0.1 * 100), // 10% of total
        },
        quantity: 1,
      } as any);
    }

    // 3. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems as any,
      mode: 'payment',
      allow_promotion_codes: true, // Enable coupons from dashboard
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        order_items: JSON.stringify(items.map(i => ({ id: i.id, q: i.quantity }))),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Session Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
