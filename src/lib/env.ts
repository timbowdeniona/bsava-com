import { z } from 'zod';

const envSchema = z.object({
  // Contentful
  CONTENTFUL_SPACE_ID: z.string().min(1),
  CONTENTFUL_DELIVERY_TOKEN: z.string().min(1),
  CONTENTFUL_PREVIEW_TOKEN: z.string().optional(),
  CONTENTFUL_MANAGEMENT_TOKEN: z.string().optional(),

  // PIMcore
  PIMCORE_BASE_URL: z.string().url(),
  PIMCORE_REST_API_TOKEN: z.string().min(1),
  PIMCORE_PRODUCTS_ROOT_PATH: z.string().optional().default('/BSAVA'),

  // Algolia
  NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().optional(),
  NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: z.string().optional(),
  ALGOLIA_ADMIN_API_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
  CONTENTFUL_DELIVERY_TOKEN: process.env.CONTENTFUL_DELIVERY_TOKEN,
  CONTENTFUL_PREVIEW_TOKEN: process.env.CONTENTFUL_PREVIEW_TOKEN,
  CONTENTFUL_MANAGEMENT_TOKEN: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  PIMCORE_BASE_URL: process.env.PIMCORE_BASE_URL,
  PIMCORE_REST_API_TOKEN: process.env.PIMCORE_REST_API_TOKEN,
  NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
  ALGOLIA_ADMIN_API_KEY: process.env.ALGOLIA_ADMIN_API_KEY,
});
