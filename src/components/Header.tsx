import Link from 'next/link';
import { getHeader } from '@/lib/contentful';
import { Entry } from 'contentful';
import { NavigationItemSkeleton } from '@/types/contentful';

export default async function Header() {
  const header = await getHeader();

  if (!header) return null;

  const { navigationItems } = header.fields;

  return (
    <header className="bg-white border-b border-bsava-gray sticky top-0 z-50">
      <nav className="max-w-[1360px] mx-auto px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-bsava-navy font-bold text-2xl tracking-tighter">
              BSAVA
            </Link>
            <div className="h-6 w-px bg-bsava-gray hidden md:block" />
            <span className="text-bsava-blue font-semibold text-sm uppercase tracking-widest hidden md:block">
              Internal Documentation
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex gap-8 items-center font-inter text-bsava-navy font-semibold uppercase text-sm">
              {(navigationItems as any[])?.map((item) => {
                if (!item || !('fields' in item)) return null;
                const navItem = item as unknown as Entry<NavigationItemSkeleton>;
                const { label, url } = navItem.fields;
                return (
                  <Link
                    key={navItem.sys.id}
                    href={url as string}
                    className="hover:text-bsava-blue transition-colors"
                  >
                    {label as string}
                  </Link>
                );
              })}
            </div>
            <button className="bg-bsava-blue text-white px-6 py-2 uppercase font-bold text-sm tracking-wide hover:bg-bsava-navy transition-colors">
              MyBSAVA
            </button>
          </div>
          <button className="lg:hidden p-2 text-bsava-navy">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
