import React from 'react';
import { PimcoreProduct } from '@/types/pimcore';
import { PriceBadge } from './PriceBadge';

interface EventCardProps {
  product: PimcoreProduct;
}

export function EventCard({ product }: EventCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border boundary-gray shadow-sm hover:shadow-xl hover:border-bsava-blue transition-all duration-300 group flex flex-col h-full">
      <div className="p-6 bg-bsava-navy text-white relative">
        <div className="absolute top-4 right-4 bg-bsava-blue text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest">
           {product.productType}
        </div>
        <div className="text-bsava-blue font-mono text-[10px] uppercase tracking-widest mb-2">
          {product.location || 'Location TBC'}
        </div>
        <h3 className="text-xl font-bold min-h-[3.5rem] leading-tight mb-2">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
           {formatDate(product.startDate) || 'Date TBC'}
           {product.endDate && ` - ${formatDate(product.endDate)}`}
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-4">
          <PriceBadge label="Member" price={product.memberPrice} highlight={true} />
          <PriceBadge label="Non-Member" price={product.nonMemberPrice} />
        </div>

        <p className="text-sm text-slate-600 line-clamp-4 mb-6 leading-relaxed italic">
          {product.description || "Join BSAVA for this exclusive professional event."}
        </p>

        <button className="w-full py-3 bg-bsava-blue text-white font-bold uppercase text-[10px] tracking-widest hover:bg-bsava-navy transition-colors mt-auto">
          Register Now &rarr;
        </button>
      </div>
    </div>
  );
}
