import { env } from './env';
import type { PimcoreProduct, PimcoreGraphQLResponse } from '@/types/pimcore';

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
    next: { revalidate: 3600 } // Default cache 1 hour
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
  const path = `/pimcore-graphql-webservices/products?apikey=${apiKey}`;
  const url = `${env.PIMCORE_BASE_URL.replace(/\/$/, '')}${path}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 } 
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

export const getProducts = async (limit: number = 10): Promise<PimcoreProduct[]> => {
  const rootPath = env.PIMCORE_PRODUCTS_ROOT_PATH;
  const query = `
    query getProducts($first: Int, $filter: String) {
      getProductListing(first: $first, filter: $filter) {
        edges {
          node {
            id
            productType
            title
            sku
            description
            mainImage {
              fullpath
            }
            basePrice
            author
            isbn
            publicationDate
            startDate
            endDate
            location
            swoogoId
            brightspaceId
            entitlementRequired
          }
        }
      }
    }
  `;
  
  // Filter by path matching the root folder
  const filter = JSON.stringify({
    path: { "$like": `${rootPath}%` }
  });

  const data = await pimcoreGraphQL<{ getProductListing: { edges: { node: PimcoreProduct }[] } }>(query, { first: limit, filter });
  return data.getProductListing.edges.map(edge => edge.node);
};

export const getPimcoreProduct = async (id: string | number): Promise<PimcoreProduct> => {
  const query = `
    query getProduct($id: ID!) {
      getProduct(id: $id) {
        id
        productType
        title
        sku
        description
        mainImage {
          fullpath
        }
        basePrice
        author
        isbn
        publicationDate
        startDate
        endDate
        location
        swoogoId
        brightspaceId
        entitlementRequired
      }
    }
  `;
  const data = await pimcoreGraphQL<{ getProduct: PimcoreProduct }>(query, { id });
  return data.getProduct;
};
