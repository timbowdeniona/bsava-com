import { loadEnvConfig } from '@next/env';
import { algoliasearch } from 'algoliasearch';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';

// Load environment variables from .env.local before importing any application modules
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY;
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_MAIN_INDEX;

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY || !ALGOLIA_INDEX_NAME) {
  console.error("Missing required Algolia environment variables in .env.local");
  process.exit(1);
}

// Initialize the Algolia client with the admin API key
const indexName = ALGOLIA_INDEX_NAME as string;
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);

// ── PIMcore Products ────────────────────────────────────────────────────────

async function syncPimcoreProducts() {
  console.log('[PIMcore] Fetching products...');
  try {
    const { getProducts } = await import('../src/lib/pimcore');
    const products = await getProducts(100);
    console.log(`[PIMcore] Found ${products.length} products.`);

    const objects = products.map((product) => ({
      objectID: `pimcore_${product.id}`,
      type: 'product',        // Top-level type facet
      dataSource: 'pimcore',
      ...product,
    }));

    const result = await client.saveObjects({ indexName, objects });
    console.log(`[PIMcore] ✓ Pushed ${objects.length} product records.`, result);
  } catch (err) {
    console.error(`[PIMcore] Error syncing products:`, err);
  }
}

// ── Contentful Articles ─────────────────────────────────────────────────────

async function syncContentfulArticles() {
  console.log('[Contentful] Fetching articles...');
  try {
    const { getAllArticles } = await import('../src/lib/contentful');
    const articles = await getAllArticles();
    console.log(`[Contentful] Found ${articles.length} articles.`);

    const objects = articles.map((entry) => {
      const fields = entry.fields;

      // Resolve linked author entry (may be undefined if not linked)
      const authorEntry = fields.author && 'fields' in fields.author
        ? fields.author
        : null;
      const authorName = authorEntry ? (authorEntry.fields.name as string) : undefined;

      // Resolve cover image URL
      const coverImageAsset = fields.coverImage && 'fields' in fields.coverImage
        ? fields.coverImage
        : null;
      const coverImageUrl = coverImageAsset
        ? `https:${(coverImageAsset.fields as { file?: { url?: string } }).file?.url ?? ''}`
        : undefined;

      // Serialise Rich Text body to plain text for full-text search
      const bodyText = fields.body ? documentToPlainTextString(fields.body) : '';

      return {
        objectID: `contentful_article_${entry.sys.id}`,
        type: 'article',
        dataSource: 'contentful',
        title: fields.headline,
        slug: fields.slug,
        publicationDate: fields.publicationDate,
        body: bodyText,
        coverImageUrl,
        authorName,
      };
    });

    const result = await client.saveObjects({ indexName, objects });
    console.log(`[Contentful] ✓ Pushed ${objects.length} article records.`, result);
  } catch (err) {
    console.error(`[Contentful] Error syncing articles:`, err);
  }
}

// ── Contentful Authors ──────────────────────────────────────────────────────

async function syncContentfulAuthors() {
  console.log('[Contentful] Fetching authors...');
  try {
    const { getAllAuthors } = await import('../src/lib/contentful');
    const authors = await getAllAuthors();
    console.log(`[Contentful] Found ${authors.length} authors.`);

    const objects = authors.map((entry) => {
      const fields = entry.fields;

      // Resolve avatar image URL
      const avatarAsset = fields.avatar && 'fields' in fields.avatar
        ? fields.avatar
        : null;
      const avatarUrl = avatarAsset
        ? `https:${(avatarAsset.fields as { file?: { url?: string } }).file?.url ?? ''}`
        : undefined;

      // Serialise Rich Text bio to plain text
      const bioText = fields.bio ? documentToPlainTextString(fields.bio) : '';

      return {
        objectID: `contentful_author_${entry.sys.id}`,
        type: 'author',
        dataSource: 'contentful',
        title: fields.name,   // Use 'title' as a common searchable field across all types
        slug: fields.slug,
        bio: bioText,
        email: fields.email,
        avatarUrl,
      };
    });

    const result = await client.saveObjects({ indexName, objects });
    console.log(`[Contentful] ✓ Pushed ${objects.length} author records.`, result);
  } catch (err) {
    console.error(`[Contentful] Error syncing authors:`, err);
  }
}

// ── Placeholder Sources ─────────────────────────────────────────────────────

async function syncSalesforce() {
  console.log('[Salesforce] Placeholder for syncing Salesforce records...');
  // TODO: Implement SF sync logic when integrated
}

async function syncBrightspace() {
  console.log('[Brightspace] Placeholder for syncing Brightspace courses...');
  // TODO: Implement Brightspace sync logic when integrated
}

async function syncSwoogo() {
  console.log('[Swoogo] Placeholder for syncing Swoogo events...');
  // TODO: Implement Swoogo sync logic when integrated
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Starting Algolia Index Synchronization');
  console.log('======================================');

  await syncPimcoreProducts();
  await syncContentfulArticles();
  await syncContentfulAuthors();
  await syncSalesforce();
  await syncBrightspace();
  await syncSwoogo();

  console.log('======================================');
  console.log('Synchronization Complete.');
}

main().catch((err) => {
  console.error('Fatal synchronization error:', err);
  process.exit(1);
});
