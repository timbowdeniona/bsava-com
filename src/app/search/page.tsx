"use client";

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  Hits,
  useHits,
  RefinementList,
  Configure,
  Index,
  Highlight,
  useInstantSearch,
} from 'react-instantsearch';
import { getPimcoreImageUrl } from '@/lib/images';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY as string
);

const indexName = process.env.NEXT_PUBLIC_ALGOLIA_MAIN_INDEX as string;

// ── Types ─────────────────────────────────────────────────────────────────────

type BaseHit = { objectID: string; type: string };

type ArticleHit = BaseHit & {
  title: string;
  slug: string;
  body?: string;
  publicationDate?: string;
  authorName?: string;
  coverImageUrl?: string;
};

type AuthorHit = BaseHit & {
  title: string;
  slug?: string;
  bio?: string;
  email?: string;
  avatarUrl?: string;
};

type ProductHit = BaseHit & {
  title: string;
  productType: string;
  sku: string;
  basePrice?: string;
  mainImage?: { fullpath: string };
};

// ── Card components ───────────────────────────────────────────────────────────

function ArticleCard({ hit }: { hit: ArticleHit }) {
  const date = hit.publicationDate
    ? new Date(hit.publicationDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <a href={`/news/${hit.slug}`} className="group flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center">
        {hit.coverImageUrl ? (
          <img src={hit.coverImageUrl} alt={hit.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {date && <span className="text-xs text-gray-400">{date}</span>}
          {hit.authorName && <span className="text-xs text-gray-400">· {hit.authorName}</span>}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-1 transition-colors">
          <Highlight attribute="title" hit={hit as any} />
        </h3>
        {hit.body && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            <Highlight attribute="body" hit={hit as any} />
          </p>
        )}
      </div>
    </a>
  );
}

function AuthorCard({ hit }: { hit: AuthorHit }) {
  const inner = (
    <>
      {hit.avatarUrl ? (
        <img src={hit.avatarUrl} alt={hit.title} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-100" loading="lazy" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center flex-shrink-0 text-lg font-bold text-amber-700">
          {hit.title.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-amber-700 truncate transition-colors">
          <Highlight attribute="title" hit={hit as any} />
        </h3>
        {hit.bio && (
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
            <Highlight attribute="bio" hit={hit as any} />
          </p>
        )}
        {hit.slug && <span className="text-xs text-amber-600 mt-0.5 block group-hover:underline">View profile →</span>}
      </div>
    </>
  );

  const baseClass = "group flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all duration-200";

  return hit.slug
    ? <a href={`/authors/${hit.slug}`} className={baseClass}>{inner}</a>
    : <div className={baseClass}>{inner}</div>;
}

function ProductCard({ hit }: { hit: ProductHit }) {
  const imageUrl = getPimcoreImageUrl(hit.mainImage?.fullpath);
  return (
    <div className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-emerald-200 hover:shadow-md transition-all duration-200">
      <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center p-3">
        {imageUrl ? (
          <img src={imageUrl} alt={hit.title} className="w-full h-full object-contain mix-blend-multiply" loading="lazy" />
        ) : (
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )}
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <span className="inline-block self-start px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full mb-2">
          {hit.productType}
        </span>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-grow group-hover:text-emerald-700 transition-colors">
          <Highlight attribute="title" hit={hit as any} />
        </h3>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <span className="text-sm font-bold text-gray-900">{hit.basePrice ? `£${hit.basePrice}` : '—'}</span>
          <span className="text-xs text-gray-400">{hit.sku}</span>
        </div>
      </div>
    </div>
  );
}

// ── Section wrapper — only renders if there are hits ──────────────────────────

function Section({
  title,
  accentClass,
  children,
}: {
  title: string;
  accentClass: string;
  children: React.ReactNode;
}) {
  const { results } = useInstantSearch();
  if (!results || results.nbHits === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className={`w-1 h-5 rounded-full ${accentClass}`} />
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <span className="text-xs text-gray-400 font-normal">
          {results.nbHits} result{results.nbHits !== 1 ? 's' : ''}
        </span>
      </div>
      {children}
    </section>
  );
}

// ── Product section (includes inline productType filter) ──────────────────────

const refinementPillStyles = [
  '[&_.ais-RefinementList-list]:flex',
  '[&_.ais-RefinementList-list]:flex-wrap',
  '[&_.ais-RefinementList-list]:gap-2',
  '[&_.ais-RefinementList-list]:mb-4',
  '[&_.ais-RefinementList-item]:inline-flex',
  '[&_.ais-RefinementList-label]:inline-flex',
  '[&_.ais-RefinementList-label]:items-center',
  '[&_.ais-RefinementList-label]:gap-1.5',
  '[&_.ais-RefinementList-label]:px-3',
  '[&_.ais-RefinementList-label]:py-1',
  '[&_.ais-RefinementList-label]:rounded-full',
  '[&_.ais-RefinementList-label]:border',
  '[&_.ais-RefinementList-label]:border-gray-200',
  '[&_.ais-RefinementList-label]:bg-white',
  '[&_.ais-RefinementList-label]:text-xs',
  '[&_.ais-RefinementList-label]:font-medium',
  '[&_.ais-RefinementList-label]:text-gray-600',
  '[&_.ais-RefinementList-label]:cursor-pointer',
  '[&_.ais-RefinementList-label]:hover:border-emerald-400',
  '[&_.ais-RefinementList-label]:hover:text-emerald-700',
  '[&_.ais-RefinementList-label]:transition-colors',
  '[&_.ais-RefinementList-checkbox]:hidden',
  '[&_.ais-RefinementList-item--selected_.ais-RefinementList-label]:bg-emerald-50',
  '[&_.ais-RefinementList-item--selected_.ais-RefinementList-label]:border-emerald-400',
  '[&_.ais-RefinementList-item--selected_.ais-RefinementList-label]:text-emerald-800',
  '[&_.ais-RefinementList-count]:text-gray-400',
].join(' ');

function ProductSection() {
  const { results } = useInstantSearch();
  if (!results || results.nbHits === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-1 h-5 rounded-full bg-emerald-400" />
        <h2 className="text-base font-semibold text-gray-800">Products</h2>
        <span className="text-xs text-gray-400 font-normal">
          {results.nbHits} result{results.nbHits !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Pill-style productType filter */}
      <div className={refinementPillStyles}>
        <RefinementList attribute="productType" />
      </div>

      {/* Product grid */}
      <div className="[&_.ais-Hits-list]:grid [&_.ais-Hits-list]:grid-cols-2 [&_.ais-Hits-list]:sm:grid-cols-3 [&_.ais-Hits-list]:lg:grid-cols-4 [&_.ais-Hits-list]:gap-4 [&_.ais-Hits-item]:h-full">
        <Hits hitComponent={ProductCard as any} />
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  if (!indexName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full bg-red-50 p-6 rounded-lg text-red-800 border-l-4 border-red-500">
          <h2 className="text-lg font-bold mb-2">Configuration Error</h2>
          <p>The Algolia index name is not configured. Check your <code>.env.local</code>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero search bar ── */}
      <div className="bg-white border-b border-gray-200 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 text-center">Search BSAVA</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Products, articles &amp; authors — all in one place.</p>
          <InstantSearch searchClient={searchClient} indexName={indexName}>
            {/* We use an outer InstantSearch just to drive the SearchBox query — the inner Indexes share this state */}
            <InnerSearchPage />
          </InstantSearch>
        </div>
      </div>
    </div>
  );
}

// Inner component so useInstantSearch is within InstantSearch context
function InnerSearchPage() {
  const { indexUiState } = useInstantSearch();
  const hasQuery = !!indexUiState.query;

  return (
    <>
      {/* Search Box */}
      <div className="[&_.ais-SearchBox-form]:relative
                      [&_.ais-SearchBox-input]:block
                      [&_.ais-SearchBox-input]:w-full
                      [&_.ais-SearchBox-input]:pl-11
                      [&_.ais-SearchBox-input]:pr-4
                      [&_.ais-SearchBox-input]:py-3.5
                      [&_.ais-SearchBox-input]:rounded-xl
                      [&_.ais-SearchBox-input]:border
                      [&_.ais-SearchBox-input]:border-gray-300
                      [&_.ais-SearchBox-input]:bg-white
                      [&_.ais-SearchBox-input]:text-gray-900
                      [&_.ais-SearchBox-input]:shadow-sm
                      [&_.ais-SearchBox-input]:placeholder-gray-400
                      [&_.ais-SearchBox-input]:focus:outline-none
                      [&_.ais-SearchBox-input]:focus:ring-2
                      [&_.ais-SearchBox-input]:focus:ring-indigo-500
                      [&_.ais-SearchBox-input]:focus:border-transparent
                      [&_.ais-SearchBox-submit]:absolute
                      [&_.ais-SearchBox-submit]:left-3.5
                      [&_.ais-SearchBox-submit]:top-1/2
                      [&_.ais-SearchBox-submit]:-translate-y-1/2
                      [&_.ais-SearchBox-submit]:text-gray-400
                      [&_.ais-SearchBox-reset]:absolute
                      [&_.ais-SearchBox-reset]:right-3.5
                      [&_.ais-SearchBox-reset]:top-1/2
                      [&_.ais-SearchBox-reset]:-translate-y-1/2
                      [&_.ais-SearchBox-reset]:text-gray-400">
        <SearchBox placeholder="Search products, articles, authors…" autoFocus />
      </div>

      {/* ── Federated results ── */}
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Articles */}
        <Index indexId="articles-section" indexName={indexName}>
          <Configure filters="type:article" hitsPerPage={4} />
          <Section title="Articles" accentClass="bg-indigo-400">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&_.ais-Hits-list]:contents [&_.ais-Hits-item]:contents">
              <Hits hitComponent={ArticleCard as any} />
            </div>
          </Section>
        </Index>

        {/* Authors */}
        <Index indexId="authors-section" indexName={indexName}>
          <Configure filters="type:author" hitsPerPage={4} />
          <Section title="Authors" accentClass="bg-amber-400">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&_.ais-Hits-list]:contents [&_.ais-Hits-item]:contents">
              <Hits hitComponent={AuthorCard as any} />
            </div>
          </Section>
        </Index>

        {/* Products with inline productType facet */}
        <Index indexId="products-section" indexName={indexName}>
          <Configure filters="type:product" hitsPerPage={8} />
          <ProductSection />
        </Index>

        {/* Empty state when no query */}
        {!hasQuery && (
          <div className="text-center py-12 text-gray-400">
            <svg className="mx-auto w-12 h-12 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm">Start typing to search across products, articles and authors.</p>
          </div>
        )}
      </div>
    </>
  );
}
