'use client';

import { useCart } from '@/lib/store/useCart';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartIcon() {
  const count = useCart((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="relative p-2 text-bsava-navy opacity-0">
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </div>
  );


  return (
    <Link href="/cart" className="relative p-2 text-bsava-navy hover:text-bsava-blue transition-colors group">
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {count > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-bsava-blue rounded-full group-hover:bg-bsava-navy transition-colors">
          {count}
        </span>
      )}
    </Link>
  );
}
