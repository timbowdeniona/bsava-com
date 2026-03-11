import { getProducts } from '@/lib/pimcore';
import { ProductCard } from '@/components/products/ProductCard';

export default async function ProductsPage() {
  const products = await getProducts(24).catch(() => []);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-[1440px] mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-bsava-navy/10 pb-8">
          <div>
            <h1 className="text-5xl font-extrabold text-bsava-navy tracking-tight uppercase mb-2">
              BSAVA Resources
            </h1>
            <p className="text-bsava-blue font-bold tracking-[0.2em] uppercase text-sm">
              Books • Ebooks • Events • Courses • Membership
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={`${product.id}-${product.productType}`} product={product} />
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
