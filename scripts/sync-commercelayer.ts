import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { CommerceLayer, Organization } from '@commercelayer/sdk';
import { CommerceLayer, Organization } from '@commercelayer/sdk';
import { pimcoreFetch, getProducts } from '../src/lib/pimcore';

const COMMERCELAYER_CLIENT_ID = process.env.NEXT_PUBLIC_COMMERCELAYER_CLIENT_ID;
const COMMERCELAYER_CLIENT_SECRET = process.env.COMMERCELAYER_CLIENT_SECRET;
const COMMERCELAYER_ENDPOINT = process.env.NEXT_PUBLIC_COMMERCELAYER_ENDPOINT;

if (!COMMERCELAYER_CLIENT_ID || !COMMERCELAYER_ENDPOINT) {
  console.error('Missing CommerceLayer env variables');
  process.exit(1);
}

// We need an integration token for this, the public one is for sales channels
// Since the user might only have provided the sales channel one, we'll try to get
// an integration token. 
// If they didn't provide a secret, we will log instructions.
if (!COMMERCELAYER_CLIENT_SECRET) {
  console.error('\nMissing COMMERCELAYER_CLIENT_SECRET in .env.local.');
  console.error('To sync catalogs, we need an *Integration* application in CommerceLayer.');
  console.error('1. Go to CommerceLayer Dashboard > Integration > Applications');
  console.error('2. Create an "Integration" app.');
  console.error('3. Add its Client ID and Secret to .env.local as:');
  console.error('   COMMERCELAYER_INTEGRATION_CLIENT_ID=...');
  console.error('   COMMERCELAYER_CLIENT_SECRET=...\n');
  process.exit(1);
}

const COMMERCELAYER_INTEGRATION_CLIENT_ID = process.env.COMMERCELAYER_INTEGRATION_CLIENT_ID || COMMERCELAYER_CLIENT_ID;


// Utility to authenticate with CommerceLayer via OAuth
async function authenticateCommerceLayer() {
  const url = `${COMMERCELAYER_ENDPOINT}/oauth/token`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: COMMERCELAYER_INTEGRATION_CLIENT_ID,
      client_secret: COMMERCELAYER_CLIENT_SECRET,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`CommerceLayer Auth Error: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Ensure at least a default market exists
async function ensureMarketExists(cl: any) {
    // 1. Get or create a merchant
    let merchants = await cl.merchants.list();
    let merchant = merchants[0];
    if (!merchant) {
        console.log('Creating default merchant...');
        merchant = await cl.merchants.create({
            name: 'BSAVA Merchant',
            addressId: null // Typically you need an address, but keeping simple for now
        });
    }

    // 2. Get or create a price list
    let priceLists = await cl.price_lists.list();
    let priceList = priceLists.find((pl: any) => pl.currencyCode === 'GBP');
    if (!priceList) {
        console.log('Creating GBP Price List...');
        priceList = await cl.price_lists.create({
            name: 'UK Market Price List',
            currencyCode: 'GBP',
            taxIncluded: true
        });
    }

    // 3. Get or create a stock location
    let stockLocations = await cl.stock_locations.list();
    let stockLocation = stockLocations[0];
    if (!stockLocation) {
        console.log('Creating default Stock Location...');
        stockLocation = await cl.stock_locations.create({
            name: 'Default Stock Location'
        });
    }

    // 4. Get or create a stock item list
    let stockItems = await cl.stock_items.list(); // simplistic check
    // Actually we need an inventory model
    let inventoryModels = await cl.inventory_models.list();
    let inventoryModel = inventoryModels[0];
    if (!inventoryModel) {
        console.log('Creating Inventory Model...');
        inventoryModel = await cl.inventory_models.create({
            name: 'Standard Inventory Model',
            strategy: 'no_split'
        });
        
        // Tie inventory model to stock location
        await cl.inventory_stock_locations.create({
            inventoryModel: { id: inventoryModel.id },
            stockLocation: { id: stockLocation.id },
            priority: 1
        });
    }

    // 5. Create the Market
    let markets = await cl.markets.list();
    let market = markets.find((m: any) => m.name === 'UK Market');
    if (!market) {
        console.log('Creating UK Market...');
        market = await cl.markets.create({
            name: 'UK Market',
            merchant: { id: merchant.id },
            priceList: { id: priceList.id },
            inventoryModel: { id: inventoryModel.id }
        });
    } else {
        console.log('UK Market found:', market.id);
    }

    return { market, priceList, stockLocation };
}

async function runSync() {
  console.log('Starting PIMcore -> CommerceLayer Sync...');
  
  try {
    const accessToken = await authenticateCommerceLayer();
    console.log('CommerceLayer authenticated successfully.');
    
    // Initialize the CommerceLayer SDK
    const cl = CommerceLayer({
      organization: COMMERCELAYER_ENDPOINT.split('//')[1].split('.')[0], // Extracts organization slug
      accessToken,
    });
    
    const { priceList, stockLocation } = await ensureMarketExists(cl);

    console.log('Fetching products from PIMcore...');
    const products = await getProducts(100); // Fetch top 100 for now
    console.log(`Found ${products.length} products to sync.`);

    for (const product of products) {
      if (!product.sku) {
          console.warn(`Product ${product.title} has no SKU, skipping.`);
          continue;
      }

      console.log(`Syncing SKU: ${product.sku} - ${product.title}`);

      // 1. Create or Update SKU
      let skuRecord;
      try {
        const existingSkus = await cl.skus.list({ filters: { code_eq: product.sku } });
        if (existingSkus.length > 0) {
            skuRecord = existingSkus[0];
            skuRecord = await cl.skus.update({
                id: skuRecord.id,
                name: product.title,
                description: product.description,
                imageUrl: product.mainImage?.fullpath ? `${process.env.NEXT_PUBLIC_PIMCORE_BASE_URL}${product.mainImage.fullpath}` : undefined
            });
            console.log(`  Updated SKU ${product.sku}`);
        } else {
            skuRecord = await cl.skus.create({
                code: product.sku,
                name: product.title,
                description: product.description,
                reference: `pimcore_${product.id}`,
                imageUrl: product.mainImage?.fullpath ? `${process.env.NEXT_PUBLIC_PIMCORE_BASE_URL}${product.mainImage.fullpath}` : undefined
            });
            console.log(`  Created SKU ${product.sku}`);
        }
      } catch (err: any) {
        console.error(`  Error creating/updating SKU ${product.sku}:`, err.message);
        continue; // Skip pricing/stock if SKU fails
      }

      // 2. Set Price (Member Price by default for now in the base UK market)
      if (product.memberPrice) {
          try {
              // Price must be in cents/pence! Assuming product.memberPrice is GBP or similar decimal
              const priceCents = Math.round(product.memberPrice * 100); 
              
              const existingPrices = await cl.prices.list({ 
                  filters: { 
                      sku_code_eq: product.sku,
                      price_list_id_eq: priceList.id
                  } 
              });

              if (existingPrices.length > 0) {
                  await cl.prices.update({
                      id: existingPrices[0].id,
                      amountCents: priceCents,
                  });
                   console.log(`  Updated Price to ${product.memberPrice}`);
              } else {
                  await cl.prices.create({
                      amountCents: priceCents,
                      priceList: { id: priceList.id, type: "price_lists" },
                      sku: { id: skuRecord.id, type: "skus" }
                  });
                  console.log(`  Created Price: ${product.memberPrice}`);
              }
          } catch(err: any) {
              console.error(`  Error setting price for ${product.sku}:`, err.message);
          }
      }

      // 3. Set Stock (Infinite for digital/memberships, standard 100 for dev)
      try {
          const isDigital = ['EBook', 'Membership', 'Event', 'Course'].includes(product.productType || '');
          const existingStock = await cl.stock_items.list({
              filters: {
                  sku_code_eq: product.sku,
                  stock_location_id_eq: stockLocation.id
              }
          });

          if (existingStock.length > 0) {
              await cl.stock_items.update({
                  id: existingStock[0].id,
                  quantity: isDigital ? 99999 : 100
              });
              console.log(`  Updated Stock`);
          } else {
              await cl.stock_items.create({
                  quantity: isDigital ? 99999 : 100,
                  sku: { id: skuRecord.id, type: "skus" },
                  stockLocation: { id: stockLocation.id, type: "stock_locations" }
              });
              console.log(`  Created Stock`);
          }
      } catch (err: any) {
          console.error(`  Error setting stock for ${product.sku}:`, err.message);
      }
    }

    console.log('Sync Complete!');

  } catch (error) {
    console.error('Fatal Sync Error:', error);
  }
}

runSync();
