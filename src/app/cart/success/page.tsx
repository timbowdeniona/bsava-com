'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { PageContainer, PageHero, SurfaceCard } from '@/components/page/PagePrimitives';
import { useCart } from '@/lib/store/useCart';

export default function SuccessPage() {
  const clearCart = useCart((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title="Payment Successful"
        description="Your order has been placed successfully. You will receive a confirmation email shortly."
        centered
      />
      <PageContainer className="pb-16 md:pb-20">
        <SurfaceCard className="mx-auto max-w-[760px] px-8 py-12 md:px-12 md:py-14">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1d1c1d]/8 text-[#1d1c1d]">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="max-w-[520px] font-inter text-[16px] leading-[1.55] text-[#5d5d5d]">
              Your basket has been cleared and your purchase is confirmed. You can continue browsing BSAVA resources or return to the homepage.
            </p>
            <div className="flex flex-col gap-4 md:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center bg-[#1d1c1d] px-5 py-[15px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-white transition-colors hover:bg-black"
              >
                Return Home
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center border border-[#d9d9d9] px-5 py-[15px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-[#1d1c1d] transition-colors hover:bg-black/5"
              >
                Continue Browsing
              </Link>
            </div>
          </div>
        </SurfaceCard>
      </PageContainer>
    </div>
  );
}
