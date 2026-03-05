import * as contentful from 'contentful-management';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const makeRichTextList = (items: string[]) => ({
  nodeType: 'document',
  data: {},
  content: [
    {
      nodeType: 'unordered-list',
      data: {},
      content: items.map((item) => ({
        nodeType: 'list-item',
        data: {},
        content: [
          {
            nodeType: 'paragraph',
            data: {},
            content: [{ nodeType: 'text', value: item, marks: [], data: {} }],
          },
        ],
      })),
    },
  ],
});

const membershipsData = [
  {
    title: 'Full Vet Member',
    type: 'vet',
    price: '£299',
    priceDescription: 'Per year (Save £15 with Direct Debit)',
    benefits: [
      'Free Printed Small Animal Formulary',
      'BSAVA App Access',
      'Free Regional CPD',
      '35% Book Discounts',
      'Journal of Small Animal Practice',
    ],
    detailedBenefits: [
      'A free printed copy of the BSAVA Small Animal Formulary Part A (Canine and Feline)',
      'BSAVA App, with access to essential resources including the BSAVA Small Animal Formulary Parts A and B',
      'Free regional and member-only CPD, plus extensive discounted CPD',
      '25 searches in BSAVA Rover, our brand-new AI Assistant',
      'Discounted registration for BSAVA events',
      'Free access to Congress lectures on demand via the BSAVA Library',
      'Save 35% on all BSAVA print and digital publications',
      'One-third off a subscription to the VETbytes App',
      'Complimentary subscription to Companion and JSAP',
    ],
    ctaLink: 'https://bsavaportal.bsava.com/s/become-a-member?grade=vet',
    ctaText: 'Join now',
  },
  {
    title: 'Vet Nurse Member',
    type: 'nurse',
    price: '£99',
    priceDescription: 'Per year (Save £5 with Direct Debit)',
    benefits: [
      'Free BSAVA Pocketbook for Nurses',
      'BSAVA App Access',
      'Free Regional CPD',
      '35% Book Discounts',
      'Companion Subscription',
    ],
    detailedBenefits: [
      'Free regional and member-only CPD, plus extensive discounted CPD',
      'Free BSAVA Pocketbook for Veterinary Nurses – essential quick reference guide',
      'Discounted registration for BSAVA events',
      '25 searches in BSAVA Rover, our brand-new AI Assistant',
      'Free access to Congress lectures on demand via the BSAVA Library',
      'Save 35% on all BSAVA print and digital publications',
      'Complimentary subscription to Companion',
      'Free access to downloadable Client Information Leaflets',
      'BSAVA Vet Nurse Member pin badge',
    ],
    ctaLink: 'https://bsavaportal.bsava.com/s/become-a-member?grade=nurse',
    ctaText: 'Join now',
  },
  {
    title: 'Student Vet Member',
    type: 'student',
    price: 'FREE',
    priceDescription: 'For the duration of your studies',
    benefits: [
      'BSAVA App Access',
      '35% Book Discounts',
      'EMS Resources',
      'VETbytes Subscription',
      'Online Companion & JSAP',
    ],
    detailedBenefits: [
      'BSAVA App, with access to essential resources including the BSAVA Small Animal Formulary',
      'Save 35% on all BSAVA print and digital publications',
      '25 searches in BSAVA Rover, our brand-new AI Assistant',
      'Online access to Companion and JSAP',
      'Small animal pre-clinical EMS resource in the BSAVA digital library',
      'Bite-size regional CPD',
      'Discounted registration for BSAVA events',
      'Free access to Congress lectures on demand via the BSAVA Library',
      'Free subscription to VETbytes App',
    ],
    ctaLink: 'https://bsavaportal.bsava.com/s/become-a-member?grade=student',
    ctaText: 'Join for free',
  },
];

const testimonialsData = [
  {
    author: 'Sarah Jenkins',
    authorPosition: 'Full Member, Veterinary Surgeon',
    text: "BSAVA membership has been invaluable for my clinical practice. The Formulary and the library resources are my go-to every single day. The community support is just the icing on the cake.",
  },
  {
    author: 'Tom Roberts',
    authorPosition: 'Vet Nurse Member',
    text: "Being a BSAVA member gives me the confidence that I'm at the forefront of nurse education. The CPD is top-notch and the Pocketbook is always in my scrub pocket!",
  },
  {
    author: 'Chloe Williams',
    authorPosition: 'Student Member',
    text: "As a student, having free access to the BSAVA resources has made my studies so much easier. The EMS resources and the app are essential tools for any vet student in the UK.",
  },
];

const main = async () => {
  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN as string,
  });

  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID as string);
  const env = await space.getEnvironment('master');

  console.log('Ensuring membership content type exists...');
  let membershipType;
  try {
    membershipType = await env.getContentType('membership');
    console.log('  Membership content type already exists.');
  } catch {
    console.log('  Creating membership content type...');
    membershipType = await env.createContentTypeWithId('membership', {
      name: 'Membership',
      fields: [
        { id: 'title', name: 'Title', type: 'Symbol', required: true, localized: false },
        { id: 'type', name: 'Type', type: 'Symbol', required: true, localized: false, validations: [{ in: ['vet', 'nurse', 'student', 'other'] }] },
        { id: 'price', name: 'Price', type: 'Symbol', required: true, localized: false },
        { id: 'priceDescription', name: 'Price Description', type: 'Symbol', required: false, localized: false },
        { id: 'benefits', name: 'Benefits', type: 'Array', required: false, localized: false, items: { type: 'Symbol' } },
        { id: 'detailedBenefits', name: 'Detailed Benefits', type: 'RichText', required: false, localized: false },
        { id: 'ctaLink', name: 'CTA Link', type: 'Symbol', required: false, localized: false },
        { id: 'ctaText', name: 'CTA Text', type: 'Symbol', required: false, localized: false },
      ],
    });
    await membershipType.publish();
    console.log('  Membership content type created and published.');
  }

  console.log('\nCreating membership entries...');
  for (const m of membershipsData) {
    const entry = await env.createEntry('membership', {
      fields: {
        title: { 'en-US': m.title },
        type: { 'en-US': m.type },
        price: { 'en-US': m.price },
        priceDescription: { 'en-US': m.priceDescription },
        benefits: { 'en-US': m.benefits },
        detailedBenefits: { 'en-US': makeRichTextList(m.detailedBenefits) },
        ctaLink: { 'en-US': m.ctaLink },
        ctaText: { 'en-US': m.ctaText },
      },
    });
    await entry.publish();
    console.log(`  Created membership: ${m.title}`);
  }

  console.log('\nCreating testimonials...');
  for (const t of testimonialsData) {
    try {
      const entry = await env.createEntry('testimonial', {
        fields: {
          author: { 'en-US': t.author },
          authorPosition: { 'en-US': t.authorPosition },
          text: { 'en-US': {
            nodeType: 'document',
            data: {},
            content: [{
              nodeType: 'paragraph',
              data: {},
              content: [{ nodeType: 'text', value: t.text, marks: [], data: {} }],
            }],
          } },
        },
      });
      await entry.publish();
      console.log(`  Created testimonial from: ${t.author}`);
    } catch (err) {
      console.error(`  Failed to create testimonial for ${t.author}.`, err);
    }
  }

  console.log('\nDone!');
};

main().catch(console.error);
