'use client';

import { useCart } from '@/lib/store/useCart';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getPimcoreImageUrl } from '@/lib/images';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="max-w-4xl mx-auto p-8 min-h-screen" />;

  const subtotal = items.reduce((acc, item) => {
    // Default to nonMemberPrice for now, or memberPrice if nonMember is missing
    const price = item.nonMemberPrice || item.memberPrice || 0;
    return acc + price * item.quantity;
  }, 0);

  const handleCheckout = async () => {
    console.log('Initiating checkout with items:', items);
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      
      const data = await response.json();
      console.log('Checkout response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(`Checkout Error: ${error.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 min-h-screen flex flex-col items-center justify-center gap-6 bg-white">
        <h1 className="text-3xl font-bold text-bsava-navy">Your Basket is Empty</h1>
        <p className="text-gray-600">Browse our products and events to add them to your basket.</p>
        <Link href="/products" className="bg-bsava-blue text-white px-8 py-3 rounded-md font-bold hover:bg-bsava-navy transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen bg-white">
      <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-bsava-navy uppercase tracking-tight">Your Basket</h1>
        <button onClick={clearCart} className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors">
          Clear All
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {items.map((item) => (
          <div key={item.id} className="flex gap-6 border-b border-gray-100 pb-8">
            <div className="relative w-24 h-32 bg-gray-50 flex-shrink-0 rounded-md overflow-hidden">
              {item.mainImage?.fullpath && (
                <Image
                  src={getPimcoreImageUrl(item.mainImage.fullpath)!}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-bsava-navy leading-tight">{item.title}</h2>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-bsava-blue font-bold uppercase tracking-widest mt-1">
                  {item.productType}
                </p>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-x border-gray-300 min-w-[40px] text-center font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 line-through">
                    £{((item.nonMemberPrice || 0) * item.quantity).toFixed(2)} (Non-Member)
                  </div>
                  <div className="text-xl font-bold text-bsava-blue">
                    £{((item.memberPrice || 0) * item.quantity).toFixed(2)} (Member)
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 p-8 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-medium text-gray-600">Subtotal</span>
          <span className="text-3xl font-bold text-bsava-navy">£{subtotal.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500 mb-8 italic">
          Taxes and shipping calculated at checkout. Membership discounts applied where applicable.
        </p>
        <button
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="w-full bg-bsava-blue text-white py-4 rounded-md font-bold text-lg uppercase tracking-widest hover:bg-bsava-navy transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isCheckingOut ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            'Proceed to Checkout'
          )}
        </button>
      </div>
    </div>
  );
}
