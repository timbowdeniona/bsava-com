import * as contentful from 'contentful-management';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const main = async () => {
  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN as string,
  });

  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID as string);
  const env = await space.getEnvironment('master');

  console.log('Fixing display fields...');

  // Fix Membership
  try {
    const membershipType = await env.getContentType('membership');
    membershipType.displayField = 'title';
    await membershipType.update();
    await membershipType.publish();
    console.log('  Membership display field set to "title"');
  } catch (err) {
    console.error('  Failed to update membership content type', err);
  }

  // Fix Testimonial (author is usually a good title)
  try {
    const testimonialType = await env.getContentType('testimonial');
    testimonialType.displayField = 'author';
    await testimonialType.update();
    await testimonialType.publish();
    console.log('  Testimonial display field set to "author"');
  } catch (err) {
    console.error('  Failed to update testimonial content type', err);
  }

  console.log('\nDone!');
};

main().catch(console.error);
