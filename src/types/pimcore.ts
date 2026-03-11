export interface PimcoreProduct {
  id: string | number;
  productType: 'Book' | 'Event' | 'EBook' | 'Membership' | 'Course';
  title: string;
  sku?: string;
  description?: string;
  mainImage?: {
    fullpath: string;
  };
  basePrice?: number;
  // Publications
  author?: string;
  isbn?: string;
  publicationDate?: string;
  // Events/LMS
  startDate?: string;
  endDate?: string;
  location?: string;
  swoogoId?: string;
  brightspaceId?: string;
  // Security
  entitlementRequired?: boolean;
}

export interface PimcoreGraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}
