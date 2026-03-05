import * as contentful from 'contentful-management';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const listCt = async (id: string) => {
  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN as string,
  });

  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID as string);
  const environment = await space.getEnvironment('master');
  
  const ct = await environment.getContentType(id);
  console.log(`Content Type: ${ct.name} (${ct.sys.id})`);
  console.log(`Display Field: ${ct.displayField}`);
  console.dir(ct.fields, { depth: null });
};

const typeId = process.argv[2] || 'article';
listCt(typeId).catch(console.error);
