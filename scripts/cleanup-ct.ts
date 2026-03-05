import * as contentful from 'contentful-management';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const keepCt = ['article', 'author', 'testimonial'];

const cleanup = async () => {
  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN as string,
  });

  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID as string);
  const environment = await space.getEnvironment('master');
  
  const contentTypes = await environment.getContentTypes();
  console.log("Existing Content Types to check:");
  
  for(const ct of contentTypes.items) {
    if(!keepCt.includes(ct.sys.id)) {
        console.log(`\nCleaning up CT: ${ct.sys.id}`);
        try {
            const entries = await environment.getEntries({ content_type: ct.sys.id, limit: 1000 });
            console.log(`  Found ${entries.items.length} entries to delete.`);
            for(const entry of entries.items) {
                try {
                    if (entry.isPublished()) {
                        await entry.unpublish();
                    }
                    await entry.delete();
                } catch(e: any) {
                    console.error(`  Could not delete entry ${entry.sys.id}`, e.message || e);
                }
            }
        } catch (e) {
            console.error(`  Could not fetch/delete entries for ${ct.sys.id}`);
        }

        try{
            if (ct.isPublished()) {
                await ct.unpublish();
            }
        }catch(e: any){}
        
        try{
            await ct.delete();
            console.log(`  Deleted CT ${ct.sys.id} successfully.`);
        }catch(e: any){
             console.log(`  Could not delete CT ${ct.sys.id}: `, e.message || e);
        }
    } else {
        console.log(`\nSkipping CT: ${ct.sys.id}`);
    }
  }
};

cleanup().catch(console.error);
