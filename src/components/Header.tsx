import Link from 'next/link';
import { getHeader } from '@/lib/contentful';
import type { Entry } from 'contentful';
import { NavigationItemSkeleton } from '@/types/contentful';
import CartIcon from './CartIcon';

const FIGMA_HEADER_LOGO_URL = 'https://www.figma.com/api/mcp/asset/33066781-4dff-49a8-a699-1e1286635aa4';
const FALLBACK_HEADER_TITLE = 'Internal Proof of Concept & Documentation';

function isResolvedNavigationItem(item: unknown): item is Entry<NavigationItemSkeleton> {
  return Boolean(item && typeof item === 'object' && 'fields' in item && 'sys' in item);
}

export default async function Header() {
  const header = await getHeader();

  if (!header) return null;

  const { navigationItems } = header.fields;
  const rawSiteTitle = header.fields.title as string | undefined;
  const siteTitle =
    rawSiteTitle && rawSiteTitle !== 'Main Header' ? rawSiteTitle : FALLBACK_HEADER_TITLE;
  const navigationCandidates = Array.isArray(navigationItems) ? navigationItems : [];
  const resolvedNavigationItems = navigationCandidates.filter(isResolvedNavigationItem);
  const navigationLabelOverrides: Record<string, string> = {
    '/products': 'Resources',
  };

  return (
    <header className="bg-black text-white">
      <nav className="px-6 py-5 md:px-10 md:py-[26px]">
        <div className="mx-auto flex max-w-[1291px] items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4 md:gap-10">
            <Link href="/" className="shrink-0" aria-label="BSAVA home">
              {/* Figma supplied this logo as an image asset rather than vector markup. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FIGMA_HEADER_LOGO_URL}
                alt="BSAVA"
                className="block h-[27.7px] w-[111.8px] object-contain"
              />
            </Link>
            <span className="font-inter hidden min-w-0 text-[14px] font-semibold italic leading-none text-[#d5d5d5] md:block">
              {siteTitle}
            </span>
          </div>

          <div className="hidden lg:flex items-center justify-end gap-10">
            <div className="font-inter flex items-center gap-[18px] text-[14px] font-semibold leading-none text-white">
              {resolvedNavigationItems.map((navItem) => {
                const { label, url } = navItem.fields;
                const href = url as string;
                return (
                  <Link
                    key={navItem.sys.id}
                    href={href}
                    className="whitespace-nowrap transition-opacity hover:opacity-80"
                  >
                    {navigationLabelOverrides[href] ?? (label as string)}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <CartIcon theme="inverted" />
              <button
                type="button"
                className="inline-flex h-[29px] items-center justify-center rounded-[2px] bg-bsava-blue px-5 text-[14px] leading-none text-white transition-colors hover:bg-bsava-light-blue"
              >
                My BSAVA
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <CartIcon theme="inverted" />
            <button type="button" className="p-2 text-white" aria-label="Open navigation menu">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
