import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Link from "next/link";
import { notFound } from "next/navigation";

import EditorialCard from "@/components/page/EditorialCard";
import { PageBackLink, PageContainer, PageHero, SectionHeading, SurfaceCard } from "@/components/page/PagePrimitives";
import { getArticlesByAuthor, getAuthorBySlug } from "@/lib/contentful";
import { formatShortDate, getArticleExcerpt, getContentfulAssetUrl } from "@/lib/contentful-ui";

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) notFound();

  const { name, bio, avatar, email } = author.fields;

  // Resolve avatar URL
  const avatarUrl =
    avatar &&
    typeof avatar === 'object' &&
    'fields' in avatar &&
    (avatar as { fields?: { file?: { url?: string } } }).fields?.file?.url
      ? `https:${(avatar as { fields: { file: { url: string } } }).fields.file.url}`
      : null;

  // Fetch articles written by this author
  const articles = await getArticlesByAuthor(author.sys.id);

  return (
    <div className="min-h-screen bg-white">
      <PageHero title={name as string} description={email as string | undefined} />

      <PageContainer className="pb-16 md:pb-20">
        <div className="mb-8">
          <PageBackLink href="/search" label="Back to Search" />
        </div>

        <div className="mx-auto flex max-w-[960px] flex-col gap-10">
          <SurfaceCard className="p-8 md:p-10">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              <div className="shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={name as string}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#1d1c1d]/8 font-bsava-display text-[44px] tracking-[-0.05em] text-[#1d1c1d]">
                    {(name as string).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-5">
                <SectionHeading title="Author profile" />
                {bio ? (
                  <div className="content-rich">
                    {/* @ts-expect-error - Contentful rich text renderer has complex types */}
                    {documentToReactComponents(bio)}
                  </div>
                ) : (
                  <p className="font-inter text-[16px] leading-[1.55] text-[#5d5d5d]">
                    No author biography is currently available.
                  </p>
                )}
                {email ? (
                  <Link
                    href={`mailto:${email as string}`}
                    className="inline-flex w-fit items-center justify-center bg-[#1d1c1d] px-5 py-[15px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-white transition-colors hover:bg-black"
                  >
                    Contact author
                  </Link>
                ) : null}
              </div>
            </div>
          </SurfaceCard>

          {articles.length > 0 ? (
            <section className="flex flex-col gap-8">
              <SectionHeading
                title={`Articles by ${name as string}`}
                description="Browse the latest articles published by this author."
              />
              <div className="grid justify-center gap-x-[30px] gap-y-[38px] md:grid-cols-2 xl:grid-cols-[repeat(3,300px)]">
                {articles.map((article) => {
                  const { headline, slug: articleSlug, publicationDate, coverImage } = article.fields;

                  return (
                    <EditorialCard
                      key={article.sys.id}
                      href={`/news/${articleSlug as string}`}
                      title={headline as string}
                      excerpt={getArticleExcerpt(article, 120)}
                      imageUrl={getContentfulAssetUrl(coverImage)}
                      imageAlt={headline as string}
                      secondaryMeta={formatShortDate(publicationDate as string) ?? undefined}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </PageContainer>
    </div>
  );
}
