import { getProducts } from "@/lib/pimcore";
import NewsSummary from "@/app/components/NewsSummary";
import Link from "next/link";
import Image from "next/image";
import { getPimcoreImageUrl } from "@/lib/images";
import HomeHero from "@/components/HomeHero";

export default async function Home() {
  const products = await getProducts(3).catch(() => []);

  return (
    <div className="min-h-screen bg-white">
      <HomeHero />

      <div className="mx-auto max-w-[1360px] px-8 py-16">
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
                      <Image 
                        src={getPimcoreImageUrl(product.mainImage.fullpath)!} 
                        alt={product.title} 
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain p-4 bg-white" 
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
      </div>
    </div>
  );
}
