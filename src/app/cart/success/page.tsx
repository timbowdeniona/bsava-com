'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/store/useCart';
import Link from 'next/link';

export default function SuccessPage() {
  const clearCart = useCart((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen flex flex-col items-center justify-center text-center gap-6">
      <div className="bg-green-100 p-4 rounded-full text-green-600">
        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-bsava-navy">Payment Successful!</h1>
      <p className="text-gray-600 text-lg">Thank you for your purchase. You will receive a confirmation email shortly.</p>
      <div className="flex gap-4 mt-4">
        <Link href="/" className="bg-bsava-blue text-white px-8 py-3 rounded-md font-bold hover:bg-bsava-navy transition-colors">
          Return Home
        </Link>
        <Link href="/products" className="border border-bsava-blue text-bsava-blue px-8 py-3 rounded-md font-bold hover:bg-gray-50 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
