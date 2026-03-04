import { getProducts } from './src/lib/pimcore';

async function main() {
  try {
    const products = await getProducts(50);
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
