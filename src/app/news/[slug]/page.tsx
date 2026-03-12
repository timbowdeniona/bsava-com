import { getArticleBySlug } from '@/lib/contentful';
import type { AuthorSkeleton } from '@/types/contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import type { Entry } from 'contentful';
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

export const dynamic = "force-dynamic";

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { headline, body, publicationDate, author, coverImage } = article.fields;

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-bsava-gray px-8 py-4 flex justify-between items-center max-w-[1360px] mx-auto">
        <div className="text-bsava-navy font-bold text-2xl tracking-tighter">
          <Link href="/">BSAVA</Link>
        </div>
        <nav className="flex gap-8 items-center font-inter text-bsava-navy font-semibold uppercase text-sm">
          <Link href="/#news" className="hover:text-bsava-blue">News</Link>
          <Link href="/products" className="hover:text-bsava-blue">Products</Link>
          <button className="bg-bsava-blue text-white px-6 py-2 uppercase">MyBSAVA</button>
        </nav>
      </header>

      {/* Hero image */}
      {imageUrl && (
        <div className="w-full max-h-[480px] overflow-hidden">
          <img
            src={imageUrl}
            alt={headline as string}
            className="w-full h-[480px] object-cover"
          />
        </div>
      )}

      <main className="max-w-[800px] mx-auto px-8 py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-bsava-orange font-bold uppercase text-xs tracking-widest mb-10 hover:underline"
        >
          &larr; Back to News
        </Link>

        <article>
          {/* Headline */}
          <div className="border-l-[8px] border-bsava-orange pl-8 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-bsava-navy tracking-tight leading-tight">
              {headline as string}
            </h1>
          </div>

          {/* Byline */}
          <div className="flex items-center gap-4 mb-12 pb-8 border-b border-bsava-gray">
            <div className="w-10 h-10 rounded-full bg-bsava-navy/10 flex items-center justify-center text-bsava-navy font-bold text-sm shrink-0">
              {authorName ? authorName.charAt(0) : 'B'}
            </div>
            <div className="font-inter">
              {authorName && (
                <p className="text-sm font-semibold text-bsava-navy">{authorName}</p>
              )}
              {publicationDate && (
                <p className="text-xs text-bsava-navy/50">{formatDate(publicationDate as string)}</p>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="prose prose-lg font-inter max-w-none text-bsava-navy/80 leading-relaxed [&>p]:mb-6">
            {/* @ts-expect-error - Contentful rich text renderer has complex types */}
            {documentToReactComponents(body)}
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-bsava-navy text-white py-12 px-8 mt-16">
        <div className="max-w-[1360px] mx-auto opacity-60 font-inter text-xs text-center">
          &copy; 2026 British Small Animal Veterinary Association (BSAVA). All rights reserved. Registered Charity No. 267159.
        </div>
      </footer>
    </div>
  );
}
