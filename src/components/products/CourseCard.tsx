import React from 'react';
import { PimcoreProduct } from '@/types/pimcore';
import { PriceBadge } from './PriceBadge';

interface CourseCardProps {
  product: PimcoreProduct;
}

export function CourseCard({ product }: CourseCardProps) {
  return (
    <div className="bg-white border boundary-gray shadow-sm hover:shadow-xl hover:border-bsava-blue transition-all duration-300 group flex flex-col h-full overflow-hidden">
      {/* Visual Header for Courses */}
      <div className="h-3 bg-gradient-to-r from-bsava-navy to-bsava-blue"></div>
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-slate-100 text-bsava-navy text-[9px] font-black px-2 py-1 uppercase tracking-tighter rounded">
            LMS • {product.productType}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {product.sku || 'COURSE-ID'}
          </div>
        </div>

        <h3 className="text-xl font-bold text-bsava-navy mb-4 line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-bsava-blue transition-colors">
          {product.title}
        </h3>

        <div className="flex items-center gap-4 mb-6 pt-4 border-t border-slate-50">
          <PriceBadge label="Member" price={product.memberPrice} highlight={true} />
          <PriceBadge label="Non-Member" price={product.nonMemberPrice} />
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4 text-bsava-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Self-Paced Learning</span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {product.description || "Enhanced clinical skills through evidence-based learning."}
          </p>
        </div>

        <button className="w-full py-3 border-2 border-bsava-navy text-bsava-navy font-bold uppercase text-[10px] tracking-widest hover:bg-bsava-navy hover:text-white transition-all mt-auto">
          View Syllabus &rarr;
        </button>
      </div>
    </div>
  );
}
