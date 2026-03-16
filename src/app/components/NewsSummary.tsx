import type { Entry } from "contentful";

import NewsInsightCard from "@/components/page/NewsInsightCard";
import { getLatestArticles } from "@/lib/contentful";
import { formatShortDate, getArticleExcerpt, getContentfulAssetUrl } from "@/lib/contentful-ui";
import type { ArticleSkeleton } from "@/types/contentful";

const NEWS_PANEL_MARK_URL = "/figma/news-panel-mark.svg";

export default async function NewsSummary() {
  const articles = await getLatestArticles(3).catch(() => []);

  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#ffd200]">
      <div className="mx-auto flex max-w-[1372px] flex-col gap-8 px-6 py-10 md:px-10 md:py-12 lg:gap-[38px] lg:px-10 lg:py-10">
        <div className="flex items-center gap-[14px] md:gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={NEWS_PANEL_MARK_URL}
            alt=""
            aria-hidden="true"
            className="h-[31px] w-[26px] shrink-0 md:h-[39.18px] md:w-[33.6px]"
          />
          <h2 className="font-bsava-display text-[28px] leading-[1.05] tracking-[-0.05em] text-black md:text-[32px] lg:text-[36px]">
            Latest news &amp; insights
          </h2>
        </div>

        {articles.length === 0 ? (
          <div className="w-full border-2 border-dashed border-black/20 bg-white/60 px-8 py-12 text-center font-inter italic text-black/55">
            No recent articles found in Contentful.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-[34px]">
            {articles.map((article) => {
              const { headline, slug, publicationDate } = article.fields;

              return (
                <NewsInsightCard
                  key={article.sys.id}
                  href={`/news/${slug as string}`}
                  title={headline as string}
                  excerpt={getArticleExcerpt(article as Entry<ArticleSkeleton>)}
                  imageUrl={getContentfulAssetUrl(article.fields.coverImage)}
                  imageAlt={headline as string}
                  dateText={formatShortDate(publicationDate as string)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
