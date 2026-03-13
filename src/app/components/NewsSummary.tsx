import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";
import type { Entry } from "contentful";
import Link from "next/link";

import { getLatestArticles } from "@/lib/contentful";
import type { ArticleSkeleton } from "@/types/contentful";

const NEWS_PANEL_MARK_URL = "/figma/news-panel-mark.svg";
const NEWS_PANEL_CTA_ARROW_URL = "/figma/news-panel-cta-arrow.svg";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const getImageUrl = (article: Entry<ArticleSkeleton>) => {
  const { coverImage } = article.fields;

  if (
    coverImage &&
    typeof coverImage === "object" &&
    "fields" in coverImage &&
    (coverImage as { fields?: { file?: { url?: string } } }).fields?.file?.url
  ) {
    return `https:${(coverImage as { fields: { file: { url: string } } }).fields.file.url}`;
  }

  return null;
};

const getExcerpt = (article: Entry<ArticleSkeleton>) => {
  const plainText = documentToPlainTextString(article.fields.body).replace(/\s+/g, " ").trim();

  if (!plainText) {
    return "Read the full article for the latest BSAVA news and insights.";
  }

  const maxLength = 145;
  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return `${(lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated).trim()}...`;
};

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
              const imageUrl = getImageUrl(article);
              const excerpt = getExcerpt(article);

              return (
                <Link
                  key={article.sys.id}
                  href={`/news/${slug as string}`}
                  className="group flex w-full max-w-[408px] flex-col overflow-hidden bg-white pb-[30px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="relative h-[214px] w-full overflow-hidden bg-white">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={headline as string}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 text-[40px] font-black uppercase tracking-[0.12em] text-black/25">
                        BSAVA
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-[13px] px-[24px] pt-[24px]">
                    <h3 className="font-inter text-[16px] font-extrabold leading-[1.5] text-black">
                      {headline as string}
                    </h3>

                    <p className="font-inter text-[14px] font-normal leading-[1.5] text-black/85">
                      {excerpt}
                    </p>

                    <div className="mt-auto flex flex-col gap-[13px] pt-1">
                      {publicationDate && (
                        <span className="font-inter text-[14px] leading-[1.5] text-[#333333]">
                          {formatDate(publicationDate as string)}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-[5px] font-inter text-[14px] font-extrabold leading-[1.5] text-[#22155f]">
                        Read article
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={NEWS_PANEL_CTA_ARROW_URL}
                          alt=""
                          aria-hidden="true"
                          className="h-[10px] w-[8px] shrink-0"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
