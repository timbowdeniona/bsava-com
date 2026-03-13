import { getProducts } from '@/lib/pimcore';
import { ProductCard } from '@/components/products/ProductCard';
import ProductsHero from './components/ProductsHero';
import ProductsMembershipPromoCard from './components/ProductsMembershipPromoCard';
import ProductsRoverPromoCard from './components/ProductsRoverPromoCard';

export default async function ProductsPage() {
  const products = await getProducts(24).catch(() => []);
  const roverProduct = products.find((product) => /rover/i.test(product.title));
  const leadingProducts = products.slice(0, 8);
  const trailingProducts = products.slice(8);

  return (
    <div className="min-h-screen bg-slate-50">
      <ProductsHero />
      <main className="mx-auto max-w-[1440px] px-8 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.length > 0 ? (
            <>
              <ProductsMembershipPromoCard />

              {leadingProducts.map((product) => (
                <ProductCard key={`${product.id}-${product.productType}`} product={product} />
              ))}

              {roverProduct ? <ProductsRoverPromoCard product={roverProduct} /> : null}

              {trailingProducts.map((product) => (
                <ProductCard key={`${product.id}-${product.productType}`} product={product} />
              ))}
            </>
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
