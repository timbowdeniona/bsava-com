import { createClient } from 'contentful-management';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error('Missing Contentful Space ID or Management Token in .env.local');
  process.exit(1);
}

const client = createClient({
  accessToken: MANAGEMENT_TOKEN,
});

async function setupContentful() {
  try {
    const space = await client.getSpace(SPACE_ID as string);
    const environment = await space.getEnvironment('master');

    console.log('Creating Navigation Item content type...');
    const navigationItem = await environment.createContentTypeWithId('navigationItem', {
      name: 'Navigation Item',
      fields: [
        { id: 'label', name: 'Label', type: 'Symbol', required: true },
        { id: 'url', name: 'URL', type: 'Symbol', required: true },
      ],
    });
    await navigationItem.publish();

    console.log('Creating Header content type...');
    const header = await environment.createContentTypeWithId('header', {
      name: 'Header',
      fields: [
        { id: 'title', name: 'Title', type: 'Symbol', required: true },
        {
          id: 'navigationItems',
          name: 'Navigation Items',
          type: 'Array',
          items: {
            type: 'Link',
            linkType: 'Entry',
            validations: [{ linkContentType: ['navigationItem'] }],
          },
        },
      ],
    });
    await header.publish();

    console.log('Creating Footer content type...');
    const footer = await environment.createContentTypeWithId('footer', {
      name: 'Footer',
      fields: [
        { id: 'text', name: 'Text', type: 'Symbol', required: true },
      ],
    });
    await footer.publish();

    console.log('Content types created and published.');

    // Populate Navigation Items
    const navLinks = [
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
      { label: 'News', url: '/news' },
      { label: 'Search', url: '/search' },
      { label: 'Architecture', url: '/architecture' },
    ];

    const navEntries = [];
    for (const link of navLinks) {
      console.log(`Creating nav item: ${link.label}`);
      const entry = await environment.createEntry('navigationItem', {
        fields: {
          label: { 'en-US': link.label },
          url: { 'en-US': link.url },
        },
      });
      await entry.publish();
      navEntries.push(entry);
    }

    console.log('Creating Header entry...');
    const headerEntry = await environment.createEntry('header', {
      fields: {
        title: { 'en-US': 'Internal Proof of Concept & Documentation' },
        navigationItems: {
          'en-US': navEntries.map((entry) => ({
            sys: { type: 'Link', linkType: 'Entry', id: entry.sys.id },
          })),
        },
      },
    });
    await headerEntry.publish();

    console.log('Creating Footer entry...');
    const footerEntry = await environment.createEntry('footer', {
      fields: {
        text: { 'en-US': 'MACH Architecture POC for BSAVA by Timberyard' },
      },
    });
    await footerEntry.publish();

    console.log('Population complete!');
  } catch (error) {
    console.error('Error:', error);
  }
}

setupContentful();
