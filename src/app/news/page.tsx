import type { AuthorSkeleton } from "@/types/contentful";
import type { Entry } from "contentful";

import EditorialCard from "@/components/page/EditorialCard";
import { EmptyState, PageContainer, PageHero } from "@/components/page/PagePrimitives";
import { getLatestArticles } from "@/lib/contentful";
import { formatShortDate, getArticleExcerpt, getContentfulAssetUrl } from "@/lib/contentful-ui";

export default async function NewsPage() {
  const articles = await getLatestArticles(24).catch(() => []);

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title="News & Insights"
        description="Explore the latest BSAVA articles, updates, and editorial insight from across the small animal veterinary community."
      />

      <PageContainer className="pb-16 md:pb-20">
        {articles.length > 0 ? (
          <div className="grid justify-center gap-x-[30px] gap-y-[38px] md:grid-cols-2 xl:grid-cols-[repeat(4,300px)]">
            {articles.map((article) => {
              const { headline, slug, publicationDate, author, coverImage } = article.fields;
              const authorEntry = author as Entry<AuthorSkeleton> | undefined;
              const authorName =
                authorEntry && "fields" in authorEntry
                  ? (authorEntry.fields.name as string)
                  : null;

              return (
                <EditorialCard
                  key={article.sys.id}
                  href={`/news/${slug as string}`}
                  title={headline as string}
                  excerpt={getArticleExcerpt(article, 120)}
                  imageUrl={getContentfulAssetUrl(coverImage)}
                  imageAlt={headline as string}
                  primaryMeta={authorName}
                  secondaryMeta={formatShortDate(publicationDate as string) ?? undefined}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No articles yet"
            description="No articles are currently published in Contentful."
          />
        )}
      </PageContainer>
    </div>
  );
}
