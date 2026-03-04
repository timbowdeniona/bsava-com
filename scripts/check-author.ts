import * as contentful from 'contentful-management';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const check = async () => {
  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN as string,
  });

  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID as string);
  const environment = await space.getEnvironment('master');
  
  const ct = await environment.getContentType('author');
  console.log("Author fields:");
  console.dir(ct.fields, { depth: null });
};

check().catch(console.error);
