import { env } from './env';
import type { PimcoreProduct, PimcoreGraphQLResponse } from '@/types/pimcore';

type PimcoreImage = { fullpath: string } | null;

interface ListingEdge<TNode> {
  node: TNode;
}

interface BookListingNode {
  id: string;
  title: string;
  isbn?: string | null;
  publishDate?: string | null;
  description?: string | null;
  coverImage?: PimcoreImage;
  memberPrice?: number | null;
  nonMemberPrice?: number | null;
}

interface EventListingNode {
  id: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  memberPrice?: number | null;
  nonMemberPrice?: number | null;
}

interface CourseListingNode {
  id: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  memberPrice?: number | null;
  nonMemberPrice?: number | null;
}

interface MembershipListingNode {
  id: string;
  name: string;
  description?: string | null;
  annualFee?: number | null;
  tierType?: string | null;
}

interface MultiClassProductsData {
  getBookListing?: { edges: Array<ListingEdge<BookListingNode>> };
  getEbookListing?: { edges: Array<ListingEdge<BookListingNode>> };
  getEventListing?: { edges: Array<ListingEdge<EventListingNode>> };
  getCourseListing?: { edges: Array<ListingEdge<CourseListingNode>> };
  getMembershipTierListing?: { edges: Array<ListingEdge<MembershipListingNode>> };
}

interface LegacyProductNode {
  id: string | number;
  productType: PimcoreProduct['productType'];
  title: string;
  sku?: string;
  description?: string;
  mainImage?: PimcoreImage;
  memberPrice?: number;
  nonMemberPrice?: number;
}

interface LegacyProductsData {
  getProductListing?: {
    edges: Array<ListingEdge<LegacyProductNode>>;
  };
}

interface PimcoreProductNode {
  id: string | number;
  title?: string;
  name?: string;
  sku?: string;
  isbn?: string;
  description?: string;
  coverImage?: PimcoreImage;
  eventImage?: PimcoreImage;
  courseImage?: PimcoreImage;
  membershipImage?: PimcoreImage;
  memberPrice?: number;
  nonMemberPrice?: number;
  annualFee?: number;
}

export interface PimcoreRequestOptions {
  headers?: Record<string, string>;
  method?: string;
  body?: unknown;
}

export const pimcoreFetch = async <T>(path: string, options: PimcoreRequestOptions = {}): Promise<T> => {
  const url = `${env.PIMCORE_BASE_URL.replace(/\/$/, '')}${path}`;
  
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${env.PIMCORE_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 } // Default cache 1 hour, disable in dev
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PIMcore API Error (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json() as Promise<T>;
};

export const pimcoreGraphQL = async <T>(query: string, variables: Record<string, unknown> = {}): Promise<T> => {
  const apiKey = env.PIMCORE_REST_API_TOKEN;
  // Standard Data Hub endpoint pattern: /pimcore-graphql-webservices/{configName}?apikey={key}
  const path = `/pimcore-graphql-webservices/bsava?apikey=${apiKey}`;
  const url = `${env.PIMCORE_BASE_URL.replace(/\/$/, '')}${path}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 } 
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PIMcore Data Hub Error (${response.status}): ${errorText || response.statusText}`);
  }

  const json = await response.json() as PimcoreGraphQLResponse<T>;

  if (json.errors) {
    throw new Error(`PIMcore GraphQL Error: ${json.errors.map(e => e.message).join(', ')}`);
  }

  return json.data;
};

export const getProducts = async (limit: number = 20): Promise<PimcoreProduct[]> => {
  // We'll perform a multi-class query to support the new specialized classes.
  // Note: This assumes all classes are exposed via the 'products' Data Hub endpoint.
  // Field names confirmed via introspection against /pimcore-graphql-webservices/bsava
  const query = `
    query getProducts($first: Int) {
      getBookListing(first: $first) { totalCount edges { node { id title isbn publishDate description coverImage { fullpath } memberPrice nonMemberPrice } } }
      getEbookListing(first: $first) { totalCount edges { node { id title isbn publishDate description coverImage { fullpath } memberPrice nonMemberPrice } } }
      getEventListing(first: $first) { totalCount edges { node { id title description startDate endDate location memberPrice nonMemberPrice } } }
      getCourseListing(first: $first) { totalCount edges { node { id title description startDate duration memberPrice nonMemberPrice } } }
      getMembershipTierListing(first: $first) { totalCount edges { node { id name description annualFee tierType } } }
    }
  `;
  
  try {
    const data = await pimcoreGraphQL<MultiClassProductsData>(query, { first: limit });
    
    // Normalize different types into a common PimcoreProduct format
    const products: PimcoreProduct[] = [];
    
    if (data.getBookListing) {
      data.getBookListing.edges.forEach((edge) => {
        products.push({
          id: edge.node.id,
          productType: 'Book',
          title: edge.node.title,
          sku: edge.node.isbn ?? undefined,
          description: edge.node.description ?? undefined,
          mainImage: edge.node.coverImage ?? undefined,
          publicationDate: edge.node.publishDate ?? undefined,
          memberPrice: edge.node.memberPrice ?? undefined,
          nonMemberPrice: edge.node.nonMemberPrice ?? undefined,
          basePrice: edge.node.memberPrice ?? undefined
        });
      });
    }

    if (data.getEbookListing) {
      data.getEbookListing.edges.forEach((edge) => {
        products.push({
          id: edge.node.id,
          productType: 'EBook',
          title: edge.node.title,
          sku: edge.node.isbn ?? undefined,
          description: edge.node.description ?? undefined,
          mainImage: edge.node.coverImage ?? undefined,
          publicationDate: edge.node.publishDate ?? undefined,
          memberPrice: edge.node.memberPrice ?? undefined,
          nonMemberPrice: edge.node.nonMemberPrice ?? undefined,
          basePrice: edge.node.memberPrice ?? undefined
        });
      });
    }

    if (data.getEventListing) {
      data.getEventListing.edges.forEach((edge) => {
        products.push({
          id: edge.node.id,
          productType: 'Event',
          title: edge.node.title,
          sku: edge.node.startDate ? `EVENT-${edge.node.startDate}` : undefined,
          description: edge.node.description ?? undefined,
          mainImage: undefined,
          startDate: edge.node.startDate ?? undefined,
          endDate: edge.node.endDate ?? undefined,
          location: edge.node.location ?? undefined,
          memberPrice: edge.node.memberPrice ?? undefined,
          nonMemberPrice: edge.node.nonMemberPrice ?? undefined,
          basePrice: edge.node.memberPrice ?? undefined
        });
      });
    }

    if (data.getCourseListing) {
      data.getCourseListing.edges.forEach((edge) => {
        products.push({
          id: edge.node.id,
          productType: 'Course',
          title: edge.node.title,
          sku: edge.node.startDate ? `COURSE-${edge.node.startDate}` : undefined,
          description: edge.node.description ?? undefined,
          mainImage: undefined,
          startDate: edge.node.startDate ?? undefined,
          memberPrice: edge.node.memberPrice ?? undefined,
          nonMemberPrice: edge.node.nonMemberPrice ?? undefined,
          basePrice: edge.node.memberPrice ?? undefined
        });
      });
    }

    if (data.getMembershipTierListing) {
      data.getMembershipTierListing.edges.forEach((edge) => {
        products.push({
          id: edge.node.id,
          productType: 'Membership',
          title: edge.node.name,
          sku: edge.node.tierType ? `MEM-${edge.node.tierType}` : 'MEM-TIER',
          description: edge.node.description ?? undefined,
          mainImage: undefined,
          memberPrice: edge.node.annualFee ?? undefined,
          nonMemberPrice: edge.node.annualFee ?? undefined, // Membership is its own price
          basePrice: edge.node.annualFee ?? undefined
        });
      });
    }

    // Sort or shuffle? For now just return
    return products.slice(0, limit);
  } catch (err) {
    // Fallback if the GraphQL endpoint doesn't support these specific listing types yet
    console.warn('Multi-class fetch failed, attempting legacy getProductListing', err);
    const legacyQuery = `
      query getLegacyProducts($first: Int) {
        getProductListing(first: $first) {
          edges {
            node {
              id
              productType
              title
              sku
              description
              mainImage { fullpath }
              memberPrice
              nonMemberPrice
            }
          }
        }
      }
    `;
    const data = await pimcoreGraphQL<LegacyProductsData>(legacyQuery, { first: limit });
    return data.getProductListing?.edges.map((e) => ({
      ...e.node,
      basePrice: e.node.memberPrice
    })) || [];
  }
};

export const getPimcoreProduct = async (id: string | number): Promise<PimcoreProduct> => {
  // Simplistic lookup by ID across types might need more complex logic in Data Hub
  // For now, assume single product fetch still works via generic 'getProduct' if configured
  const query = `
    query getProduct($id: ID!) {
      getProduct(id: $id) {
        id
        ... on Book { title sku description coverImage { fullpath } memberPrice nonMemberPrice }
        ... on Ebook { title isbn description coverImage { fullpath } memberPrice nonMemberPrice }
        ... on Event { title sku description eventImage { fullpath } memberPrice nonMemberPrice }
        ... on Course { title sku description courseImage { fullpath } memberPrice nonMemberPrice }
        ... on MembershipTier { name description membershipImage { fullpath } annualFee }
      }
    }
  `;
  const data = await pimcoreGraphQL<{ getProduct: PimcoreProductNode }>(query, { id });
  const p = data.getProduct;
  return {
    id: p.id,
    productType: 'Book', // Placeholder
    title: p.title || p.name,
    sku: p.sku || p.isbn,
    description: p.description,
    mainImage: p.coverImage || p.eventImage || p.courseImage || p.membershipImage,
    memberPrice: p.memberPrice || p.annualFee,
    nonMemberPrice: p.nonMemberPrice || p.annualFee,
    basePrice: p.memberPrice || p.annualFee
  };
};
