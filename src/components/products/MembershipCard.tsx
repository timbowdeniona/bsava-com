import React from 'react';
import { PimcoreProduct } from '@/types/pimcore';

interface MembershipCardProps {
  product: PimcoreProduct;
}

export function MembershipCard({ product }: MembershipCardProps) {
  return (
    <div className="bg-bsava-navy text-white border-2 border-bsava-blue shadow-xl group flex flex-col h-full transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-bsava-blue/10 rounded-full blur-3xl group-hover:bg-bsava-blue/20 transition-colors"></div>
      
      <div className="p-8 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="bg-bsava-blue text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest shadow-sm">
            PRO MEMBERSHIP
          </div>
        </div>

        <h3 className="text-2xl font-black mb-2 tracking-tight">
          {product.title}
        </h3>
        
        <div className="mb-6">
          <div className="text-[10px] text-bsava-blue uppercase font-bold tracking-widest mb-1">Annual Fee</div>
          <div className="text-4xl font-black tracking-tighter">
            {product.memberPrice ? `£${Number(product.memberPrice).toFixed(2)}` : 'FREE'}
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-8 leading-relaxed">
          {product.description || "Unlock exclusive clinical resources, discounts on events, and join a global community of veterinary professionals."}
        </p>

        <ul className="space-y-3 mb-8 text-xs font-bold uppercase tracking-wider text-slate-100">
          <li className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-bsava-blue flex items-center justify-center text-[10px]">✓</span>
            Discounted CPD & Events
          </li>
          <li className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-bsava-blue flex items-center justify-center text-[10px]">✓</span>
            Free Digital Publications
          </li>
          <li className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-bsava-blue flex items-center justify-center text-[10px]">✓</span>
            Exclusive Community Access
          </li>
        </ul>

        <button className="w-full py-4 bg-white text-bsava-navy font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-bsava-blue hover:text-white transition-all mt-auto">
          Join Today
        </button>
      </div>
      
      {/* Footer stripe */}
      <div className="h-1 bg-bsava-blue"></div>
    </div>
  );
}
