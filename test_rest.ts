import { pimcoreFetch } from './src/lib/pimcore';

async function main() {
  try {
    // Try to fetch an object from REST API
    // The product JSON showed ID "1220"
    const object = await pimcoreFetch(`/webservice/rest/object/id/1220`);
    console.log(JSON.stringify(object, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
