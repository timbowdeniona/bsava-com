'use client';

import { useCart } from '@/lib/store/useCart';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';

type CartIconProps = {
  theme?: 'default' | 'inverted';
};

export default function CartIcon({ theme = 'default' }: CartIconProps) {
  const count = useCart((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const iconClasses =
    theme === 'inverted'
      ? 'text-white hover:text-white/80'
      : 'text-bsava-navy hover:text-bsava-blue';
  const badgeClasses =
    theme === 'inverted'
      ? 'bg-bsava-blue text-white group-hover:bg-bsava-light-blue'
      : 'bg-bsava-blue text-white group-hover:bg-bsava-navy';

  if (!mounted) return (
    <div className={`relative p-2 opacity-0 ${iconClasses}`}>
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </div>
  );


  return (
    <Link href="/cart" className={`group relative p-2 transition-colors ${iconClasses}`}>
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {count > 0 && (
        <span className={`absolute top-0 right-0 inline-flex -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full px-2 py-1 text-xs font-bold leading-none transition-colors ${badgeClasses}`}>
          {count}
        </span>
      )}
    </Link>
  );
}
