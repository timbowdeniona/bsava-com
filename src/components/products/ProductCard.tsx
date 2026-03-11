import React from 'react';
import { PimcoreProduct } from '@/types/pimcore';
import { BookCard } from './BookCard';
import { EventCard } from './EventCard';
import { CourseCard } from './CourseCard';
import { MembershipCard } from './MembershipCard';

interface ProductCardProps {
  product: PimcoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  // Dispatch based on productType
  switch (product.productType) {
    case 'Book':
    case 'EBook':
      return <BookCard product={product} />;
    case 'Event':
      return <EventCard product={product} />;
    case 'Course':
      return <CourseCard product={product} />;
    case 'Membership':
      return <MembershipCard product={product} />;
    default:
      // Fallback for unknown types
      return <BookCard product={product} />;
  }
}
