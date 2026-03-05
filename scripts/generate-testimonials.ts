import * as contentful from 'contentful-management';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const testimonialsData = [
  {
    author: 'Sarah Jenkins',
    authorPosition: 'Full Member, Veterinary Surgeon',
    headline: 'Invaluable for my clinical practice',
    body: "BSAVA membership has been invaluable for my clinical practice. The Formulary and the library resources are my go-to every single day. The community support is just the icing on the cake.",
    rating: 5,
  },
  {
    author: 'Tom Roberts',
    authorPosition: 'Vet Nurse Member',
    headline: 'Confidence in my education',
    body: "Being a BSAVA member gives me the confidence that I'm at the forefront of nurse education. The CPD is top-notch and the Pocketbook is always in my scrub pocket!",
    rating: 5,
  },
  {
    author: 'Chloe Williams',
    authorPosition: 'Student Member',
    headline: 'Essential student tools',
    body: "As a student, having free access to the BSAVA resources has made my studies so much easier. The EMS resources and the app are essential tools for any vet student in the UK.",
    rating: 5,
  },
  {
    author: 'Dr. James Miller',
    authorPosition: 'Vet Member',
    headline: 'A career-long companion',
    body: "I've been a member since my student days, and BSAVA has supported me through every transition. The Congress is the highlight of my professional year.",
    rating: 5,
  },
  {
    author: 'Emma Thompson',
    authorPosition: 'Student Member',
    headline: 'Amazing EMS support',
    body: "The EMS resources provided by BSAVA are a lifesaver. It makes finding placements and preparing for them so much less stressful.",
    rating: 4,
  }
];

const makeRichText = (text: string) => ({
  nodeType: 'document',
  data: {},
  content: [
    {
      nodeType: 'paragraph',
      data: {},
      content: [{ nodeType: 'text', value: text, marks: [], data: {} }],
    },
  ],
});

const main = async () => {
  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN as string,
  });

  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID as string);
  const env = await space.getEnvironment('master');

  console.log('Generating testimonials...');

  for (const t of testimonialsData) {
    try {
      const entry = await env.createEntry('testimonial', {
        fields: {
          headline: { 'en-US': t.headline },
          body: { 'en-US': makeRichText(t.body) },
          author: { 'en-US': t.author },
          authorPosition: { 'en-US': t.authorPosition },
          rating: { 'en-US': t.rating },
        },
      });
      await entry.publish();
      console.log(`  Created and published testimonial from: ${t.author}`);
    } catch (err) {
      console.error(`  Failed to create testimonial for ${t.author}.`, err);
    }
  }

  console.log('\nDone!');
};

main().catch(console.error);
