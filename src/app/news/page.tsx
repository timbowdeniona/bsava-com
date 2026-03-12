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

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const articles = await getLatestArticles(24).catch(() => []);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-[1440px] mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-bsava-navy/10 pb-8">
          <div>
            <h1 className="text-5xl font-extrabold text-bsava-navy tracking-tight uppercase mb-2">
              BSAVA News
            </h1>
            <p className="text-bsava-blue font-bold tracking-[0.2em] uppercase text-sm">
              Latest Articles • Updates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {articles.length > 0 ? (
            articles.map((article) => {
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
                  className="group flex flex-col border border-bsava-gray hover:border-bsava-orange transition-all overflow-hidden bg-white"
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

                    <span className="text-bsava-orange font-bold uppercase text-xs tracking-widest mt-auto pt-4 inline-block">
                      Read Article &rarr;
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full border-2 border-dashed border-bsava-gray p-20 text-center">
              <div className="text-bsava-navy/20 font-black text-6xl mb-4 opacity-50 italic">EMPTY</div>
              <p className="text-bsava-navy/40 font-bold uppercase tracking-widest text-sm">
                No articles currently published in Contentful.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
