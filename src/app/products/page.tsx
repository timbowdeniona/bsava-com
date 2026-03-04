import { getProducts } from '@/lib/pimcore';
import Link from 'next/link';

export default async function ProductsPage() {
  const products = await getProducts(12).catch(() => []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header (Simplified for transition) */}
      <header className="border-b border-bsava-gray px-8 py-4 flex justify-between items-center max-w-[1360px] mx-auto">
        <div className="text-bsava-navy font-bold text-2xl tracking-tighter cursor-pointer">
          <Link href="/">BSAVA</Link>
        </div>
        <div className="font-inter text-bsava-navy font-semibold uppercase text-sm">
          <span>Product Catalogue</span>
        </div>
      </header>

      <main className="max-w-[1360px] mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold text-bsava-navy mb-12 tracking-tight uppercase">
          Resources & Products
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="border border-bsava-gray flex flex-col items-start hover:border-bsava-blue transition-colors group">
                <div className="w-full bg-bsava-gray/10 aspect-square relative mb-4">
                  {/* Image rendering */}
                  {product.mainImage?.fullpath ? (
                    <img 
                      src={`http://localhost:8080${product.mainImage.fullpath}`} 
                      alt={product.title} 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-bsava-navy/20 font-bold uppercase text-xs">
                      [ Product Image ]
                    </div>
                  )}
                </div>
                <div className="border-l-[5px] border-bsava-blue pl-4 py-2 mb-4 ml-4">
                  <div className="text-[10px] font-bold text-bsava-blue uppercase tracking-widest mb-1">
                    {product.productType}
                  </div>
                  <h3 className="text-lg font-bold text-bsava-navy mb-1 uppercase tracking-wide group-hover:text-bsava-blue transition-colors leading-tight">
                    {product.title}
                  </h3>
                  <p className="text-xs text-bsava-navy/60 font-mono mb-2">{product.sku}</p>
                  <p className="font-inter text-sm text-bsava-navy line-clamp-3 mb-4 pr-4">
                    {product.description || "Detailed description coming soon across the BSAVA digital ecosystem."}
                  </p>
                  <button className="text-bsava-blue font-bold uppercase text-xs tracking-widest hover:underline">
                    View Details &rarr;
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full border-2 border-dashed border-bsava-gray p-12 text-center text-bsava-navy/40 font-bold uppercase tracking-widest">
              No products found. Please verify PIMcore Data Hub configuration.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
