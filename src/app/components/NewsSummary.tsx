import { getLatestArticles } from '@/lib/contentful';
import type { AuthorSkeleton } from '@/types/contentful';
import type { Entry } from 'contentful';
import Link from 'next/link';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default async function NewsSummary() {
  const articles = await getLatestArticles(3).catch(() => []);

  if (articles.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-bsava-navy/30 italic font-inter border-2 border-dashed border-bsava-gray">
        No recent articles found in Contentful.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {articles.map((article) => {
        const { headline, slug, publicationDate, author, coverImage } = article.fields;

        const authorEntry = author as Entry<AuthorSkeleton> | undefined;
        const authorName =
          authorEntry && 'fields' in authorEntry
            ? (authorEntry.fields.name as string)
            : null;

        const imageUrl =
          coverImage &&
          typeof coverImage === 'object' &&
          'fields' in coverImage &&
          (coverImage as { fields?: { file?: { url?: string } } }).fields?.file?.url
            ? `https:${(coverImage as { fields: { file: { url: string } } }).fields.file.url}`
            : null;

        return (
          <Link
            key={article.sys.id}
            href={`/news/${slug as string}`}
            className="group flex flex-col border border-bsava-gray hover:border-bsava-orange transition-all overflow-hidden"
          >
            {/* Cover image */}
            <div className="w-full aspect-video bg-bsava-navy/5 relative overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={headline as string}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-bsava-orange/20 text-6xl font-bold select-none">
                    BSAVA
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="border-l-[5px] border-bsava-orange pl-6 py-5 pr-4 flex flex-col gap-3 flex-1">
              <h3 className="text-base font-bold text-bsava-navy uppercase tracking-wide leading-snug group-hover:text-bsava-orange transition-colors line-clamp-3">
                {headline as string}
              </h3>

              <div className="flex flex-col gap-1 mt-auto">
                {authorName && (
                  <span className="font-inter text-xs text-bsava-navy/60 font-semibold">
                    {authorName}
                  </span>
                )}
                {publicationDate && (
                  <span className="font-inter text-xs text-bsava-navy/40">
                    {formatDate(publicationDate as string)}
                  </span>
                )}
              </div>

              <span className="text-bsava-orange font-bold uppercase text-xs tracking-widest">
                Read Article &rarr;
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
