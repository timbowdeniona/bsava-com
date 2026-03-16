'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { EmptyState, PageContainer, PageHero, SectionHeading, SurfaceCard } from '@/components/page/PagePrimitives';
import { getPimcoreImageUrl } from '@/lib/images';
import { useCart } from '@/lib/store/useCart';

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
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      const message = error instanceof Error ? error.message : 'Unknown checkout error';
      alert(`Checkout Error: ${message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <PageHero
          title="Your Basket"
          description="Review the resources and events you have added before checkout."
        />
        <PageContainer className="pb-16 md:pb-20">
          <EmptyState
            title="Your basket is empty"
            description="Browse our resources and events to add them to your basket."
            actionHref="/products"
            actionLabel="Browse Resources"
          />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title="Your Basket"
        description="Review your selected resources and confirm quantities before checkout."
      />

      <PageContainer className="pb-16 md:pb-20">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <SectionHeading title="Items" description={`${items.length} item${items.length === 1 ? '' : 's'} in your basket`} />
              <button
                onClick={clearCart}
                className="font-inter text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8a3030] transition-opacity hover:opacity-70"
              >
                Clear all
              </button>
            </div>

            {items.map((item) => (
              <SurfaceCard key={item.id} className="p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  <div className="relative h-[180px] w-full shrink-0 overflow-hidden bg-[#eeeeee] md:h-[160px] md:w-[160px]">
                    {item.mainImage?.fullpath ? (
                      <Image
                        src={getPimcoreImageUrl(item.mainImage.fullpath)!}
                        alt={item.title}
                        fill
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[18px] font-black uppercase tracking-[0.14em] text-black/20">
                        BSAVA
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="font-inter text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6d6d6d]">
                          {item.productType}
                        </span>
                        <h2 className="font-inter text-[24px] font-extrabold leading-[1.2] text-[#1d1c1d]">
                          {item.title}
                        </h2>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="font-inter text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6d6d6d] transition-opacity hover:opacity-70"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                      <div className="inline-flex w-fit items-center border border-[#d9d9d9] bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-4 py-3 font-inter text-[18px] leading-none text-[#1d1c1d] transition-colors hover:bg-black/5"
                        >
                          -
                        </button>
                        <span className="min-w-[56px] border-x border-[#d9d9d9] px-4 py-3 text-center font-inter text-[16px] font-semibold text-[#1d1c1d]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-4 py-3 font-inter text-[18px] leading-none text-[#1d1c1d] transition-colors hover:bg-black/5"
                        >
                          +
                        </button>
                      </div>

                      <div className="grid gap-2 font-inter text-[14px] leading-[1.5] text-[#1d1c1d] md:text-right">
                        <div>
                          <span className="text-[#6d6d6d]">Non-members:</span>{" "}
                          <span className="font-semibold">
                            £{((item.nonMemberPrice || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6d6d6d]">Members:</span>{" "}
                          <span className="font-semibold">
                            £{((item.memberPrice || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>

          <SurfaceCard className="p-8 xl:sticky xl:top-8">
            <div className="flex flex-col gap-8">
              <SectionHeading title="Summary" />
              <div className="flex items-end justify-between gap-6 border-b border-[#e5e5e5] pb-6">
                <span className="font-inter text-[16px] leading-[1.5] text-[#5d5d5d]">Subtotal</span>
                <span className="font-bsava-display text-[34px] leading-[1] tracking-[-0.05em] text-[#1d1c1d]">
                  £{subtotal.toFixed(2)}
                </span>
              </div>

              <p className="font-inter text-[14px] leading-[1.55] text-[#5d5d5d]">
                Taxes and shipping are calculated at checkout. Membership pricing is shown where available.
              </p>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="inline-flex w-full items-center justify-center gap-3 bg-[#1d1c1d] px-5 py-[18px] font-inter text-[12px] font-semibold uppercase leading-[1.5] tracking-[0.14em] text-white transition-colors hover:bg-black disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>

              <Link
                href="/products"
                className="inline-flex w-full items-center justify-center border border-[#d9d9d9] px-5 py-[18px] font-inter text-[12px] font-semibold uppercase leading-[1.5] tracking-[0.14em] text-[#1d1c1d] transition-colors hover:bg-black/5"
              >
                Continue Browsing
              </Link>
            </div>
          </SurfaceCard>
        </div>
      </PageContainer>
    </div>
  );
}
