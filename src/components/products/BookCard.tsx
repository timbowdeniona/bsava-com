import React from 'react';
import Image from 'next/image';
import { PimcoreProduct } from '@/types/pimcore';
import { PriceBadge } from './PriceBadge';

interface BookCardProps {
  product: PimcoreProduct;
}

export function BookCard({ product }: BookCardProps) {
  const imageUrl = product.mainImage?.fullpath 
    ? `${process.env.NEXT_PUBLIC_PIMCORE_BASE_URL || 'http://35.246.89.127'}${product.mainImage.fullpath}`
    : null;

  return (
    <div className="bg-white border boundary-gray shadow-sm hover:shadow-xl hover:border-bsava-blue transition-all duration-300 group flex flex-col h-full">
      <div className="w-full aspect-[4/5] bg-slate-100 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10 bg-bsava-navy text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-lg">
          {product.productType}
        </div>
        
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={product.title} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-bsava-navy/10 font-black p-8 text-center uppercase">
            <span className="text-4xl mb-4 italic">BSAVA</span>
            <span className="text-xs tracking-widest">Book Preview</span>
          </div>
        )}
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-bsava-navy mb-2 line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-bsava-blue transition-colors">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between mb-4 gap-4">
          <PriceBadge label="Member" price={product.memberPrice} highlight={true} />
          <PriceBadge label="Non-Member" price={product.nonMemberPrice} />
        </div>

        {product.sku && (
          <div className="mb-4">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 uppercase">ISBN: {product.sku}</span>
          </div>
        )}

        <p className="text-sm text-slate-600 line-clamp-3 mb-6 leading-relaxed italic">
          {product.description || "Comprehensive veterinary resource from BSAVA."}
        </p>

        <button className="w-full py-3 bg-bsava-navy text-white font-bold uppercase text-[10px] tracking-widest hover:bg-bsava-blue transition-colors mt-auto">
          Order Copy &rarr;
        </button>
      </div>
    </div>
  );
}
