import { getProducts } from '@/lib/pimcore';
import { ProductCard } from '@/components/products/ProductCard';
import ProductsHero from './components/ProductsHero';
import ProductsMembershipPromoCard from './components/ProductsMembershipPromoCard';
import ProductsRoverPromoCard from './components/ProductsRoverPromoCard';

export default async function ProductsPage() {
  const products = await getProducts(24).catch(() => []);
  const roverProduct = products.find((product) => /rover/i.test(product.title));
  const gridProducts = products.filter(
    (product) => product.productType !== 'Membership' && !/rover/i.test(product.title)
  );
  const leadingProducts = gridProducts.slice(0, 7);
  const trailingProducts = gridProducts.slice(7);

  return (
    <div className="min-h-screen bg-white">
      <ProductsHero />
      <main className="mx-auto max-w-[1372px] px-6 pb-16 pt-10 md:px-10 md:pb-20">
        <div className="grid justify-center gap-x-[30px] gap-y-[38px] md:grid-cols-2 xl:grid-cols-[repeat(4,300px)]">
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
