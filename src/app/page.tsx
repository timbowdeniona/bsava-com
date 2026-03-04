import { getProducts } from "@/lib/pimcore";
import NewsSummary from "@/app/components/NewsSummary";
import Link from "next/link";

export default async function Home() {
  const products = await getProducts(3).catch(() => []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-bsava-gray px-8 py-4 flex justify-between items-center max-w-[1360px] mx-auto">
        <div className="text-bsava-navy font-bold text-2xl tracking-tighter">
          BSAVA
        </div>
        <nav className="flex gap-8 items-center font-inter text-bsava-navy font-semibold uppercase text-sm">
          <Link href="#" className="hover:text-bsava-blue">Membership</Link>
          <Link href="#" className="hover:text-bsava-blue">Education</Link>
          <Link href="#" className="hover:text-bsava-blue">Publications</Link>
          <Link href="/products" className="hover:text-bsava-blue">Products</Link>
          <button className="bg-bsava-blue text-white px-6 py-2 uppercase">MyBSAVA</button>
        </nav>
      </header>

      {/* Hero */}
      <main className="max-w-[1360px] mx-auto px-8 py-16">
        <section className="mb-16">
          <h1 className="text-5xl font-bold text-bsava-navy mb-6 tracking-tight">
            British Small Animal Veterinary Association
          </h1>
          <p className="text-xl text-bsava-navy max-w-2xl font-inter mb-8">
            Providing resources, education, and representation for small animal veterinary professionals across the UK.
          </p>
          <div className="flex gap-4">
            <Link href="/products" className="bg-bsava-orange text-white px-8 py-3 uppercase font-bold text-lg inline-block">
              Explore Our Resources
            </Link>
            <button className="border-2 border-bsava-light-blue text-bsava-light-blue px-8 py-3 uppercase font-bold text-lg">
              Education Portal
            </button>
          </div>
        </section>

        {/* Latest News from Contentful */}
        <section id="news" className="mb-20">
          <h2 className="text-2xl font-bold text-bsava-navy mb-8 uppercase tracking-widest border-b-2 border-bsava-orange inline-block pb-2">
            Latest News &amp; Insights
          </h2>
          <NewsSummary />
        </section>

        {/* Featured Products from PIMcore */}
        <section>
          <h2 className="text-2xl font-bold text-bsava-navy mb-8 uppercase tracking-widest border-b-2 border-bsava-blue inline-block pb-2">
            Featured Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="border border-bsava-gray flex flex-col items-start hover:border-bsava-blue transition-colors group">
                  <div className="w-full bg-bsava-gray/10 aspect-video relative">
                    {product.mainImage?.fullpath ? (
                      <img 
                        src={`http://localhost:8080${product.mainImage.fullpath}`} 
                        alt={product.title} 
                        className="absolute inset-0 w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-bsava-navy/20 font-bold uppercase text-[10px]">
                        [ PIMcore Asset ]
                      </div>
                    )}
                  </div>
                  <div className="border-l-[5px] border-bsava-blue pl-6 py-4 mx-4 mb-4">
                    <h3 className="text-lg font-bold text-bsava-navy mb-1 uppercase tracking-wide group-hover:text-bsava-blue transition-colors">
                      {product.title}
                    </h3>
                    <p className="font-inter text-xs text-bsava-navy line-clamp-2 mb-4">
                      {product.description || "BSAVA manual or clinical resource managed via PIMcore."}
                    </p>
                    <Link href="/products" className="text-bsava-blue font-bold uppercase text-[10px] tracking-widest hover:underline">
                      Explore Catalogue &rarr;
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-bsava-navy/30 italic font-inter border-2 border-dashed border-bsava-gray">
                No featured products found in PIMcore Data Hub.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-bsava-navy text-white py-12 px-8 mt-16">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 opacity-80 font-inter text-sm uppercase font-semibold">
          <div className="flex flex-col gap-4">
            <span className="font-bold border-b border-white/20 pb-2">About BSAVA</span>
            <Link href="#">Who we are</Link>
            <Link href="#">Governance</Link>
            <Link href="#">Contact Us</Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-bold border-b border-white/20 pb-2">Membership</span>
            <Link href="#">Categories</Link>
            <Link href="#">Renew</Link>
            <Link href="#">Benefits</Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-bold border-b border-white/20 pb-2">Connect</span>
            <Link href="#">Facebook</Link>
            <Link href="#">Twitter</Link>
            <Link href="#">Instagram</Link>
          </div>
          <div className="text-xs normal-case opacity-60">
            &copy; 2026 British Small Animal Veterinary Association (BSAVA). All rights reserved. Registered Charity No. 267159.
          </div>
        </div>
      </footer>
    </div>
  );
}

