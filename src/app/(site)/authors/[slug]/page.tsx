import { getAuthorBySlug, getArticlesByAuthor } from '@/lib/contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

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

      {/* ── Header ── */}
      <header className="border-b border-bsava-gray px-8 py-4 flex justify-between items-center max-w-[1360px] mx-auto">
        <div className="text-bsava-navy font-bold text-2xl tracking-tighter">
          <Link href="/">BSAVA</Link>
        </div>
        <nav className="flex gap-8 items-center font-inter text-bsava-navy font-semibold uppercase text-sm">
          <Link href="/#news" className="hover:text-bsava-blue">News</Link>
          <Link href="/products" className="hover:text-bsava-blue">Products</Link>
          <Link href="/search" className="hover:text-bsava-blue">Search</Link>
          <button className="bg-bsava-blue text-white px-6 py-2 uppercase">MyBSAVA</button>
        </nav>
      </header>

      <main className="max-w-[960px] mx-auto px-8 py-16">

        {/* ── Back link ── */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-bsava-orange font-bold uppercase text-xs tracking-widest mb-10 hover:underline"
        >
          ← Back to Search
        </Link>

        {/* ── Author profile card ── */}
        <div className="flex flex-col sm:flex-row items-start gap-8 mb-16 pb-16 border-b border-bsava-gray">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name as string}
                className="w-32 h-32 rounded-full object-cover border-4 border-bsava-gray"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-bsava-navy/10 flex items-center justify-center text-5xl font-bold text-bsava-navy">
                {(name as string).charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="border-l-[8px] border-bsava-orange pl-6 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-bsava-navy tracking-tight">
                {name as string}
              </h1>
            </div>

            {email && (
              <a
                href={`mailto:${email as string}`}
                className="inline-flex items-center gap-2 text-bsava-blue text-sm font-medium hover:underline mb-6"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {email as string}
              </a>
            )}

            {bio && (
              <div className="prose prose-base font-inter max-w-none text-bsava-navy/80 leading-relaxed">
                {/* @ts-expect-error - Contentful rich text renderer has complex types */}
                {documentToReactComponents(bio)}
              </div>
            )}
          </div>
        </div>

        {/* ── Articles by author ── */}
        {articles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-bsava-navy mb-8">
              Articles by {name as string}
            </h2>
            <div className="grid gap-6">
              {articles.map((article) => {
                const { headline, slug: articleSlug, publicationDate, coverImage } = article.fields;

                const coverUrl =
                  coverImage &&
                  typeof coverImage === 'object' &&
                  'fields' in coverImage &&
                  (coverImage as { fields?: { file?: { url?: string } } }).fields?.file?.url
                    ? `https:${(coverImage as { fields: { file: { url: string } } }).fields.file.url}`
                    : null;

                return (
                  <Link
                    key={article.sys.id}
                    href={`/news/${articleSlug as string}`}
                    className="group flex gap-5 p-5 border border-bsava-gray rounded-lg hover:border-bsava-orange hover:shadow-md transition-all duration-200"
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-28 h-20 rounded overflow-hidden bg-bsava-navy/5 flex items-center justify-center">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={headline as string}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-bsava-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      {publicationDate && (
                        <p className="text-xs text-bsava-navy/50 uppercase tracking-wider mb-1">
                          {formatDate(publicationDate as string)}
                        </p>
                      )}
                      <h3 className="text-base font-semibold text-bsava-navy group-hover:text-bsava-orange transition-colors line-clamp-2">
                        {headline as string}
                      </h3>
                    </div>

                    <div className="flex-shrink-0 self-center text-bsava-orange opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-bsava-navy text-white py-12 px-8 mt-16">
        <div className="max-w-[1360px] mx-auto opacity-60 font-inter text-xs text-center">
          © 2026 British Small Animal Veterinary Association (BSAVA). All rights reserved. Registered Charity No. 267159.
        </div>
      </footer>
    </div>
  );
}
