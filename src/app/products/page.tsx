import { getProducts } from '@/lib/pimcore';

export default async function ProductsPage() {
  const products = await getProducts(24).catch(() => []);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-[1360px] mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-bsava-navy/10 pb-8">
          <div>
            <h1 className="text-5xl font-extrabold text-bsava-navy tracking-tight uppercase mb-2">
              BSAVA Marketplace
            </h1>
            <p className="text-bsava-blue font-bold tracking-[0.2em] uppercase text-sm">
              Books • Ebooks • Events • Courses • Membership
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="bg-white border boundary-gray shadow-sm hover:shadow-xl hover:border-bsava-blue transition-all duration-300 group flex flex-col">
                <div className="w-full aspect-[4/5] bg-slate-100 relative overflow-hidden">
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10 bg-bsava-navy text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-lg">
                    {product.productType}
                  </div>
                  
                  {/* Image rendering */}
                  {product.mainImage?.fullpath ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_PIMCORE_BASE_URL || 'http://35.246.89.127'}${product.mainImage.fullpath}`} 
                      alt={product.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-bsava-navy/10 font-black p-8 text-center uppercase">
                      <span className="text-4xl mb-4 italic">BSAVA</span>
                      <span className="text-xs tracking-widest">Image Coming Soon</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-bsava-navy mb-2 line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-bsava-blue transition-colors">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 uppercase">{product.sku}</span>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Member Price</div>
                      <div className="text-xl font-black text-bsava-blue tracking-tighter">
                        {product.basePrice ? `£${Number(product.basePrice).toFixed(2)}` : 'FREE'}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-grow leading-relaxed italic">
                    {product.description || "The definitive resource for small animal practitioners within the BSAVA ecosystem."}
                  </p>

                  <button className="w-full py-3 bg-bsava-navy text-white font-bold uppercase text-[10px] tracking-widest hover:bg-bsava-blue transition-colors mt-auto">
                    Access Resource &rarr;
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full border-2 border-dashed border-bsava-gray p-20 text-center">
              <div className="text-bsava-navy/20 font-black text-6xl mb-4 opacity-50 italic">EMPTY</div>
              <p className="text-bsava-navy/40 font-bold uppercase tracking-widest text-sm">
                No resources currently synchronized from PIMcore.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
