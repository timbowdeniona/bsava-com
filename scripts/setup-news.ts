import * as contentful from 'contentful-management';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const makeRichText = (paragraphs: string[]) => ({
  nodeType: 'document',
  data: {},
  content: paragraphs.map((text) => ({
    nodeType: 'paragraph',
    data: {},
    content: [{ nodeType: 'text', value: text, marks: [], data: {} }],
  })),
});

const authorsData = [
  {
    name: 'Dr. Emily Carter',
    bio: [
      'Emily is a Diplomate of the European College of Veterinary Internal Medicine and leads the BSAVA small animal medicine working group.',
      'She has over 15 years of clinical experience and has contributed to numerous BSAVA manuals and clinical guidelines.',
    ],
  },
  {
    name: 'Prof. James Whitfield',
    bio: [
      'James is a Professor of Veterinary Oncology at the Royal Veterinary College and a long-standing BSAVA Congress speaker.',
      'His research focuses on novel immunotherapy approaches in canine and feline cancer management.',
    ],
  },
  {
    name: 'Dr. Sarah Okonkwo',
    bio: [
      'Sarah is a specialist in Emergency and Critical Care and chairs the BSAVA welfare committee.',
      'She is passionate about improving emergency preparedness in first-opinion practices across the UK.',
    ],
  },
];

const articlesData = [
  {
    headline: "BSAVA Congress 2026: Record-Breaking Attendance Highlights Profession's Resilience",
    slug: 'bsava-congress-2026-record-attendance',
    publicationDate: '2026-02-28',
    authorIndex: 0,
    body: [
      'The British Small Animal Veterinary Association annual Congress in Birmingham drew a record 7,200 delegates this year, underscoring the profession continued commitment to excellence in clinical education.',
      'The four-day event featured over 300 scientific sessions spanning disciplines from dermatology to advanced imaging. BSAVA President Marcus Hayes opened proceedings with a keynote on the future of veterinary education, emphasising the role of hybrid learning models and continuous professional development.',
      'Highlights included a sold-out workshop on point-of-care ultrasound for first-opinion practitioners and a panel discussion on the mental health crisis affecting veterinary professionals. Industry partners unveiled several new diagnostic tools, drawing long queues at the exhibition hall.',
      '"The energy this year was extraordinary," said Dr. Emily Carter, who led two internal medicine workshops. BSAVA Congress 2027 is already confirmed for ICC Birmingham, with early-bird registration opening in Q3 2026.',
    ],
  },
  {
    headline: 'New BSAVA Feline Hypertension Guidelines Now Available to Members',
    slug: 'bsava-feline-hypertension-guidelines-2026',
    publicationDate: '2026-02-14',
    authorIndex: 0,
    body: [
      'BSAVA has published updated clinical guidelines for the diagnosis and management of systemic hypertension in cats, reflecting significant advances in the evidence base since the previous guidance was issued.',
      'Chaired by Dr. Emily Carter, the guidelines task force reviewed over 200 peer-reviewed studies published in the last five years. Key updates include revised blood pressure thresholds for initiating treatment and clearer staging criteria aligned with the International Society of Hypertension in Animals.',
      'The guidelines are freely available to BSAVA members in the online library and will be incorporated into the upcoming new edition of the BSAVA Manual of Canine and Feline Nephrology and Urology.',
      'A free CPD webinar summarising the key changes will be hosted on MyBSAVA on 25 March 2026, with a Q&A session to follow.',
    ],
  },
  {
    headline: 'Study Reveals Promising Results for Immunotherapy in Canine Mast Cell Tumours',
    slug: 'immunotherapy-canine-mast-cell-tumours-study',
    publicationDate: '2026-01-30',
    authorIndex: 1,
    body: [
      'A landmark multi-centre clinical trial co-authored by BSAVA member Professor James Whitfield has demonstrated a significant improvement in progression-free survival for dogs with high-grade mast cell tumours treated with a novel PD-1 inhibitor.',
      'The trial, conducted across six UK veterinary schools and published in the Veterinary and Comparative Oncology journal, enrolled 147 dogs over three years. The combination therapy group showed a median progression-free survival of 14.6 months compared with 8.2 months in the control arm.',
      '"These results are genuinely exciting," said Prof. Whitfield. "Checkpoint inhibitors have transformed human oncology over the last decade, and we are now beginning to see a meaningful translation of that science for our canine patients."',
      'The PD-1 inhibitor used in the trial is not yet licensed for veterinary use in the UK, but the research team is working with the Veterinary Medicines Directorate to accelerate a licence application.',
    ],
  },
  {
    headline: 'BSAVA Launches Wellbeing Hub to Support Veterinary Mental Health',
    slug: 'bsava-wellbeing-hub-launch-2026',
    publicationDate: '2026-01-15',
    authorIndex: 2,
    body: [
      'BSAVA has officially launched the Wellbeing Hub, a dedicated digital resource designed to support the mental health and professional resilience of the UK small animal veterinary community.',
      'Developed in partnership with the Veterinary Benevolent Fund, Vetlife, and Mind, the Hub provides access to self-assessment tools, peer support forums, guided resilience programmes, and a directory of mental health professionals.',
      'Dr. Sarah Okonkwo, chair of the BSAVA Welfare Committee, described the launch as long overdue. "The profession has some of the highest rates of burnout of any occupational group in the UK. The Wellbeing Hub is a concrete step towards making support accessible to every member."',
      'All current BSAVA members have free, confidential access to the Hub through the MyBSAVA portal. A dedicated helpline staffed by trained counsellors is available Monday to Friday from 9am to 6pm.',
    ],
  },
];

const seed = async () => {
  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN as string,
  });

  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID as string);
  const env = await space.getEnvironment('master');

  console.log('Creating authors...');
  const authorEntries: contentful.Entry[] = [];

  for (const a of authorsData) {
    const entry = await env.createEntry('author', {
      fields: {
        name: { 'en-US': a.name },
        bio: { 'en-US': makeRichText(a.bio) },
      },
    });
    await entry.publish();
    authorEntries.push(entry);
    console.log(`  Created author: ${a.name} (${entry.sys.id})`);
  }

  console.log('\nCreating articles...');
  for (const a of articlesData) {
    const authorEntry = authorEntries[a.authorIndex];
    const entry = await env.createEntry('article', {
      fields: {
        headline: { 'en-US': a.headline },
        slug: { 'en-US': a.slug },
        publicationDate: { 'en-US': a.publicationDate },
        body: { 'en-US': makeRichText(a.body) },
        author: {
          'en-US': {
            sys: { type: 'Link', linkType: 'Entry', id: authorEntry.sys.id },
          },
        },
      },
    });
    await entry.publish();
    console.log(`  Created article: "${a.headline}"`);
  }

  console.log('\nDone! Created 3 authors and 4 BSAVA news articles.');
};

seed().catch(console.error);
