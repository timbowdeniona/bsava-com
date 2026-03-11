import Link from 'next/link';
import { getFooter } from '@/lib/contentful';

export default async function Footer() {
  const footer = await getFooter();

  if (!footer) return null;

  return (
    <footer className="bg-bsava-navy text-white py-12 px-8">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 opacity-80 font-inter text-sm uppercase font-semibold">
        <div className="flex flex-col gap-4">
          <span className="font-bold border-b border-white/20 pb-2 text-white">About BSAVA</span>
          <Link href="#" className="hover:text-bsava-orange transition-colors">Who we are</Link>
          <Link href="#" className="hover:text-bsava-orange transition-colors">Governance</Link>
          <Link href="#" className="hover:text-bsava-orange transition-colors">Contact Us</Link>
        </div>
        <div className="flex flex-col gap-4">
          <span className="font-bold border-b border-white/20 pb-2 text-white">Membership</span>
          <Link href="#" className="hover:text-bsava-orange transition-colors">Categories</Link>
          <Link href="#" className="hover:text-bsava-orange transition-colors">Renew</Link>
          <Link href="#" className="hover:text-bsava-orange transition-colors">Benefits</Link>
        </div>
        <div className="flex flex-col gap-4">
          <span className="font-bold border-b border-white/20 pb-2 text-white">Connect</span>
          <Link href="#" className="hover:text-bsava-orange transition-colors">Facebook</Link>
          <Link href="#" className="hover:text-bsava-orange transition-colors">Twitter</Link>
          <Link href="#" className="hover:text-bsava-orange transition-colors">Instagram</Link>
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-xs normal-case opacity-60">
            &copy; 2026 British Small Animal Veterinary Association (BSAVA). All rights reserved. Registered Charity No. 267159.
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 text-[10px] normal-case opacity-50 tracking-wider font-light">
            {footer.fields.text as string}
          </div>
        </div>
      </div>
    </footer>
  );
}
