"use client";

import { liteClient as algoliasearch } from "algoliasearch/lite";
import {
  Configure,
  Highlight,
  Hits,
  Index,
  InstantSearch,
  RefinementList,
  SearchBox,
  useInstantSearch,
} from "react-instantsearch";

import NewsInsightCard from "@/components/page/NewsInsightCard";
import { PageContainer, PageHero, SectionHeading, SurfaceCard } from "@/components/page/PagePrimitives";
import { formatShortDate } from "@/lib/contentful-ui";
import { getPimcoreImageUrl } from "@/lib/images";

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY as string
);

const indexName = process.env.NEXT_PUBLIC_ALGOLIA_MAIN_INDEX as string;

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

function ArticleCard({ hit }: { hit: ArticleHit }) {
  return (
    <NewsInsightCard
      href={`/news/${hit.slug}`}
      title={<Highlight attribute="title" hit={hit as never} />}
      excerpt={hit.body ? <Highlight attribute="body" hit={hit as never} /> : "Read the full article for the latest BSAVA news and insights."}
      imageUrl={hit.coverImageUrl}
      imageAlt={hit.title}
      dateText={formatShortDate(hit.publicationDate) ?? "Date TBC"}
      titleClassName="line-clamp-2 [&_mark]:bg-[#f6eb72] [&_mark]:px-[1px] [&_mark]:text-inherit"
      excerptClassName="line-clamp-3 [&_mark]:bg-[#f6eb72] [&_mark]:px-[1px] [&_mark]:text-inherit"
    />
  );
}

function AuthorCard({ hit }: { hit: AuthorHit }) {
  const content = (
    <SurfaceCard className="flex h-full w-full items-center gap-4 p-4 transition-transform duration-200 group-hover:-translate-y-0.5">
      {hit.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hit.avatarUrl}
          alt={hit.title}
          className="h-16 w-16 shrink-0 rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1d1c1d]/8 font-bsava-display text-[24px] leading-none tracking-[-0.05em] text-[#1d1c1d]">
          {hit.title.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="font-inter text-[16px] font-extrabold leading-[1.45] text-[#1d1c1d]">
          <Highlight attribute="title" hit={hit as never} />
        </h3>
        {hit.bio ? (
          <p className="line-clamp-2 font-inter text-[14px] leading-[1.5] text-[#555555]">
            <Highlight attribute="bio" hit={hit as never} />
          </p>
        ) : null}
        {hit.slug ? (
          <span className="font-inter text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d6d6d]">
            View profile →
          </span>
        ) : null}
      </div>
    </SurfaceCard>
  );

  return hit.slug ? (
    <a href={`/authors/${hit.slug}`} className="group flex h-full">
      {content}
    </a>
  ) : (
    <div className="group flex h-full">{content}</div>
  );
}

function ProductCard({ hit }: { hit: ProductHit }) {
  const imageUrl = getPimcoreImageUrl(hit.mainImage?.fullpath);

  return (
    <div className="group flex h-full">
      <SurfaceCard className="flex h-full w-full flex-col overflow-hidden pb-[24px] transition-transform duration-200 group-hover:-translate-y-0.5">
        <div className="relative h-[180px] overflow-hidden bg-[#eeeeee]">
          <span className="absolute bottom-0 left-0 rounded-tr-[4px] bg-white px-[10px] py-[5px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-[#1d1c1d]">
            {hit.productType}
          </span>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={hit.title} className="h-full w-full object-contain p-5" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-[18px] font-black uppercase tracking-[0.14em] text-black/20">
              BSAVA
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 px-4 pt-4">
          <h3 className="line-clamp-2 min-h-[48px] font-inter text-[16px] font-extrabold leading-[1.45] text-[#1d1c1d]">
            <Highlight attribute="title" hit={hit as never} />
          </h3>
          <div className="mt-auto flex items-end justify-between gap-4 border-t border-[#e5e5e5] pt-3">
            <span className="font-inter text-[14px] font-semibold leading-[1.5] text-[#1d1c1d]">
              {hit.basePrice ? `£${hit.basePrice}` : "£TBC"}
            </span>
            <span className="font-inter text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6d6d6d]">
              {hit.sku}
            </span>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}

function ResultSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (!count) return null;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <SectionHeading title={title} />
        <span className="font-inter text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6d6d6d]">
          {count} result{count === 1 ? "" : "s"}
        </span>
      </div>
      {children}
    </section>
  );
}

const refinementPillStyles = [
  "[&_.ais-RefinementList-list]:flex",
  "[&_.ais-RefinementList-list]:flex-wrap",
  "[&_.ais-RefinementList-list]:gap-2",
  "[&_.ais-RefinementList-item]:inline-flex",
  "[&_.ais-RefinementList-label]:inline-flex",
  "[&_.ais-RefinementList-label]:items-center",
  "[&_.ais-RefinementList-label]:gap-1.5",
  "[&_.ais-RefinementList-label]:rounded-[2px]",
  "[&_.ais-RefinementList-label]:border",
  "[&_.ais-RefinementList-label]:border-[#d9d9d9]",
  "[&_.ais-RefinementList-label]:bg-white",
  "[&_.ais-RefinementList-label]:px-3",
  "[&_.ais-RefinementList-label]:py-2",
  "[&_.ais-RefinementList-label]:font-inter",
  "[&_.ais-RefinementList-label]:text-[12px]",
  "[&_.ais-RefinementList-label]:font-semibold",
  "[&_.ais-RefinementList-label]:uppercase",
  "[&_.ais-RefinementList-label]:tracking-[0.14em]",
  "[&_.ais-RefinementList-label]:text-[#1d1c1d]",
  "[&_.ais-RefinementList-label]:transition-colors",
  "[&_.ais-RefinementList-label]:hover:border-[#1d1c1d]",
  "[&_.ais-RefinementList-checkbox]:hidden",
  "[&_.ais-RefinementList-item--selected_.ais-RefinementList-label]:border-[#1d1c1d]",
  "[&_.ais-RefinementList-item--selected_.ais-RefinementList-label]:bg-[#1d1c1d]",
  "[&_.ais-RefinementList-item--selected_.ais-RefinementList-label]:text-white",
  "[&_.ais-RefinementList-count]:text-current/60",
].join(" ");

function SearchContent() {
  const { indexUiState } = useInstantSearch();
  const hasQuery = !!indexUiState.query;

  return (
    <>
      <PageHero
        title="Search"
        description="Search products, articles, and authors across the BSAVA experience."
        centered
      >
        <div
          className="[&_.ais-SearchBox-form]:relative
                     [&_.ais-SearchBox-input]:block
                     [&_.ais-SearchBox-input]:w-full
                     [&_.ais-SearchBox-input]:rounded-[2px]
                     [&_.ais-SearchBox-input]:border
                     [&_.ais-SearchBox-input]:border-[#d9d9d9]
                     [&_.ais-SearchBox-input]:bg-white
                     [&_.ais-SearchBox-input]:px-4
                     [&_.ais-SearchBox-input]:py-[18px]
                     [&_.ais-SearchBox-input]:pl-12
                     [&_.ais-SearchBox-input]:font-inter
                     [&_.ais-SearchBox-input]:text-[16px]
                     [&_.ais-SearchBox-input]:leading-[1.5]
                     [&_.ais-SearchBox-input]:text-[#1d1c1d]
                     [&_.ais-SearchBox-input]:placeholder-[#8a8a8a]
                     [&_.ais-SearchBox-input]:outline-none
                     [&_.ais-SearchBox-input]:focus:border-[#1d1c1d]
                     [&_.ais-SearchBox-submit]:absolute
                     [&_.ais-SearchBox-submit]:left-4
                     [&_.ais-SearchBox-submit]:top-1/2
                     [&_.ais-SearchBox-submit]:-translate-y-1/2
                     [&_.ais-SearchBox-submit]:text-[#8a8a8a]
                     [&_.ais-SearchBox-reset]:absolute
                     [&_.ais-SearchBox-reset]:right-4
                     [&_.ais-SearchBox-reset]:top-1/2
                     [&_.ais-SearchBox-reset]:-translate-y-1/2
                     [&_.ais-SearchBox-reset]:text-[#8a8a8a]"
        >
          <div className="w-full max-w-[840px]">
            <SearchBox placeholder="Search products, articles, authors..." autoFocus />
          </div>
        </div>
      </PageHero>

      <PageContainer className="flex flex-col gap-12 pb-16 md:pb-20">
        <Index indexId="articles-section" indexName={indexName}>
          <Configure filters="type:article" hitsPerPage={4} />
          <SectionWithHits title="Articles">
            <div className="grid justify-center gap-8 md:grid-cols-[repeat(2,minmax(0,408px))] md:gap-x-[34px] md:gap-y-8 [&_.ais-Hits-list]:contents [&_.ais-Hits-item]:contents">
              <Hits hitComponent={ArticleCard as never} />
            </div>
          </SectionWithHits>
        </Index>

        <Index indexId="authors-section" indexName={indexName}>
          <Configure filters="type:author" hitsPerPage={4} />
          <SectionWithHits title="Authors">
            <div className="grid gap-4 md:grid-cols-2 [&_.ais-Hits-list]:contents [&_.ais-Hits-item]:contents">
              <Hits hitComponent={AuthorCard as never} />
            </div>
          </SectionWithHits>
        </Index>

        <Index indexId="products-section" indexName={indexName}>
          <Configure filters="type:product" hitsPerPage={8} />
          <ProductSection />
        </Index>

        {!hasQuery ? (
          <SurfaceCard className="px-8 py-12 text-center">
            <div className="mx-auto flex max-w-[520px] flex-col items-center gap-4">
              <h2 className="font-bsava-display text-[28px] leading-[1.05] tracking-[-0.05em] text-[#1d1c1d]">
                Start typing to search
              </h2>
              <p className="font-inter text-[16px] leading-[1.55] text-[#5d5d5d]">
                Browse products, articles, and authors from one place using the search box above.
              </p>
            </div>
          </SurfaceCard>
        ) : null}
      </PageContainer>
    </>
  );
}

function SectionWithHits({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { results } = useInstantSearch();

  if (!results || results.nbHits === 0) return null;

  return (
    <ResultSection title={title} count={results.nbHits}>
      {children}
    </ResultSection>
  );
}

function ProductSection() {
  const { results } = useInstantSearch();

  if (!results || results.nbHits === 0) return null;

  return (
    <ResultSection title="Products" count={results.nbHits}>
      <div className={refinementPillStyles}>
        <RefinementList attribute="productType" />
      </div>

      <div className="[&_.ais-Hits-list]:grid [&_.ais-Hits-list]:gap-4 [&_.ais-Hits-list]:md:grid-cols-2 [&_.ais-Hits-list]:xl:grid-cols-4 [&_.ais-Hits-item]:h-full">
        <Hits hitComponent={ProductCard as never} />
      </div>
    </ResultSection>
  );
}

export default function SearchPage() {
  if (!indexName) {
    return (
      <div className="min-h-screen bg-white">
        <PageHero title="Search" description="Search is currently unavailable because the Algolia index is not configured." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <InstantSearch searchClient={searchClient} indexName={indexName}>
        <SearchContent />
      </InstantSearch>
    </div>
  );
}
