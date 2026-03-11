import React from 'react';

interface PriceBadgeProps {
  label: string;
  price?: number;
  highlight?: boolean;
}

export function PriceBadge({ label, price, highlight }: PriceBadgeProps) {
  const formattedPrice = price !== undefined && price !== null 
    ? price === 0 ? 'FREE' : `£${Number(price).toFixed(2)}`
    : 'TBC';

  return (
    <div className={`flex flex-col ${highlight ? 'text-right' : 'text-left'}`}>
      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
        {label}
      </span>
      <span className={`text-lg font-black tracking-tighter ${highlight ? 'text-bsava-blue' : 'text-slate-600'}`}>
        {formattedPrice}
      </span>
    </div>
  );
}
