import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Entry } from "contentful";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageBackLink, PageContainer, PageHero, SectionHeading, SurfaceCard } from "@/components/page/PagePrimitives";
import { getArticleBySlug } from "@/lib/contentful";
import { formatLongDate, getContentfulAssetUrl } from "@/lib/contentful-ui";
import type { AuthorSkeleton } from "@/types/contentful";

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { headline, body, publicationDate, author, coverImage } = article.fields;

  const authorEntry = author as Entry<AuthorSkeleton> | undefined;
  const authorName =
    authorEntry && "fields" in authorEntry
      ? (authorEntry.fields.name as string)
      : null;
  const authorSlug =
    authorEntry && "fields" in authorEntry ? (authorEntry.fields.slug as string | undefined) : undefined;
  const imageUrl = getContentfulAssetUrl(coverImage);
  const metaLine = [authorName, formatLongDate(publicationDate as string) ?? undefined]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title={headline as string}
        description={metaLine || undefined}
      />

      <PageContainer className="pb-16 md:pb-20">
        <div className="mb-8">
          <PageBackLink href="/news" label="Back to News" />
        </div>

        <div className="mx-auto flex max-w-[960px] flex-col gap-8">
          {imageUrl ? (
            <SurfaceCard>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={headline as string} className="h-[320px] w-full object-cover md:h-[480px]" />
            </SurfaceCard>
          ) : null}

          <SurfaceCard className="p-8 md:p-10">
            <article className="content-rich">
              {/* @ts-expect-error - Contentful rich text renderer has complex types */}
              {documentToReactComponents(body)}
            </article>
          </SurfaceCard>

          {authorName ? (
            <SurfaceCard className="p-8 md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1d1c1d]/8 font-inter text-[16px] font-semibold text-[#1d1c1d]">
                    {authorName.charAt(0)}
                  </div>
                  <div className="flex flex-col gap-2">
                    <SectionHeading title="About the Author" />
                    <p className="font-inter text-[16px] leading-[1.55] text-[#5d5d5d]">{authorName}</p>
                  </div>
                </div>
                {authorSlug ? (
                  <Link
                    href={`/authors/${authorSlug}`}
                    className="inline-flex items-center justify-center bg-[#1d1c1d] px-5 py-[15px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-white transition-colors hover:bg-black"
                  >
                    View profile
                  </Link>
                ) : null}
              </div>
            </SurfaceCard>
          ) : null}
        </div>
      </PageContainer>
    </div>
  );
}
