import * as contentful from 'contentful-management';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const listTypes = async () => {
  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN as string,
  });

  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID as string);
  const environment = await space.getEnvironment('master');
  
  const contentTypes = await environment.getContentTypes();
  console.log("Existing Content Types:");
  contentTypes.items.forEach(ct => {
    console.log(`- ${ct.sys.id}: ${ct.name}`);
  });
};

listTypes().catch(console.error);
