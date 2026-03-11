import { getProducts } from "@/lib/pimcore";
import NewsSummary from "@/app/components/NewsSummary";
import Link from "next/link";

export default async function Home() {
  const products = await getProducts(3).catch(() => []);

  return (
    <div className="min-h-screen bg-white">

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
                        src={`${process.env.NEXT_PUBLIC_PIMCORE_BASE_URL || 'http://35.246.89.127'}${product.mainImage.fullpath}`} 
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

    </div>
  );
}

