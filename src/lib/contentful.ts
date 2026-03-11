import { createClient, type Entry } from 'contentful';
import { env } from './env';
import type { ArticleSkeleton, AuthorSkeleton, HeaderSkeleton, FooterSkeleton } from '@/types/contentful';

export const contentfulClient = createClient({
  space: env.CONTENTFUL_SPACE_ID,
  accessToken: env.CONTENTFUL_DELIVERY_TOKEN,
});

export const previewClient = createClient({
  space: env.CONTENTFUL_SPACE_ID,
  accessToken: env.CONTENTFUL_PREVIEW_TOKEN || '',
  host: 'preview.contentful.com',
});

export const getHeader = async (): Promise<Entry<HeaderSkeleton> | null> => {
  const response = await contentfulClient.getEntries<HeaderSkeleton>({
    content_type: 'header',
    include: 2,
    limit: 1,
  });
  return response.items[0] || null;
};

export const getFooter = async (): Promise<Entry<FooterSkeleton> | null> => {
  const response = await contentfulClient.getEntries<FooterSkeleton>({
    content_type: 'footer',
    limit: 1,
  });
  return response.items[0] || null;
};

export const getArticleBySlug = async (slug: string): Promise<Entry<ArticleSkeleton> | null> => {
  const response = await contentfulClient.getEntries<ArticleSkeleton>({
    content_type: 'article',
    'fields.slug': slug,
    include: 2,
    limit: 1,
  });
  return response.items[0] || null;
};

export const getLatestArticles = async (limit: number = 3) => {
  const response = await contentfulClient.getEntries<ArticleSkeleton>({
    content_type: 'article',
    order: ['-fields.publicationDate'],
    include: 2,
    limit,
  });
  return response.items;
};

// Fetch ALL articles for search indexing (handles pagination automatically)
export const getAllArticles = async (): Promise<Entry<ArticleSkeleton>[]> => {
  const PAGE_SIZE = 100;
  let skip = 0;
  const allItems: Entry<ArticleSkeleton>[] = [];

  while (true) {
    const response = await contentfulClient.getEntries<ArticleSkeleton>({
      content_type: 'article',
      include: 2,
      limit: PAGE_SIZE,
      skip,
    });
    allItems.push(...response.items);
    if (allItems.length >= response.total) break;
    skip += PAGE_SIZE;
  }

  return allItems;
};

// Fetch ALL authors for search indexing (handles pagination automatically)
export const getAllAuthors = async (): Promise<Entry<AuthorSkeleton>[]> => {
  const PAGE_SIZE = 100;
  let skip = 0;
  const allItems: Entry<AuthorSkeleton>[] = [];

  while (true) {
    const response = await contentfulClient.getEntries<AuthorSkeleton>({
      content_type: 'author',
      include: 1,
      limit: PAGE_SIZE,
      skip,
    });
    allItems.push(...response.items);
    if (allItems.length >= response.total) break;
    skip += PAGE_SIZE;
  }

  return allItems;
};

// Fetch a single author by their slug
export const getAuthorBySlug = async (slug: string): Promise<Entry<AuthorSkeleton> | null> => {
  const response = await contentfulClient.getEntries<AuthorSkeleton>({
    content_type: 'author',
    'fields.slug': slug,
    include: 1,
    limit: 1,
  });
  return response.items[0] || null;
};

// Fetch all articles by a given author entry ID
export const getArticlesByAuthor = async (authorId: string): Promise<Entry<ArticleSkeleton>[]> => {
  const response = await contentfulClient.getEntries<ArticleSkeleton>({
    content_type: 'article',
    'fields.author.sys.id': authorId,
    order: ['-fields.publicationDate'],
    include: 1,
    limit: 20,
  });
  return response.items;
};
