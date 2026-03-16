import fs from 'fs';
import path from 'path';

import { PageContainer, PageHero, SectionHeading, SurfaceCard } from '@/components/page/PagePrimitives';
import Mermaid from '../components/Mermaid';

export default async function ArchitecturePage() {
  const filePath = path.join(process.cwd(), 'BSAVA_MACH_ARCHITECTURE_DIAGRAM.md');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Simple parser to extract mermaid and text
  const mermaidMatch = fileContent.match(/```mermaid([\s\S]*?)```/);
  const mermaidChart = mermaidMatch ? mermaidMatch[1].trim() : '';
  
  const sections = fileContent.split('##').slice(1).map(section => {
    const lines = section.trim().split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').replace(/```mermaid[\s\S]*?```/, '').trim();
    return { title, content };
  });

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title="System Architecture"
        description="An overview of the BSAVA MACH ecosystem, showing how Next.js, Contentful, Pimcore, Algolia, and supporting services fit together."
      />

      <PageContainer className="flex flex-col gap-14 pb-16 md:gap-16 md:pb-20">
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              title="Architecture Flow"
              description="A visual reference for the service relationships, integrations, and delivery paths used across the application."
            />
            <div className="flex gap-2">
              <span className="inline-flex items-center justify-center bg-[#1d1c1d]/8 px-[10px] py-[5px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-[#1d1c1d]">
                MACH Architecture
              </span>
              <span className="inline-flex items-center justify-center bg-[#1d1c1d]/8 px-[10px] py-[5px] font-inter text-[12px] font-semibold uppercase leading-[1.5] text-[#1d1c1d]">
                Live Reference
              </span>
            </div>
          </div>

          <SurfaceCard className="overflow-x-auto p-8 lg:p-12">
            <Mermaid chart={mermaidChart} />
          </SurfaceCard>
        </section>

        <section className="flex flex-col gap-8">
          <SectionHeading
            title="System Details"
            description="Supporting notes extracted from the architecture document."
          />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section, idx) => (
            <SurfaceCard key={idx} className="p-8">
              <h3 className="mb-4 flex items-center gap-3 font-inter text-[18px] font-extrabold leading-[1.35] text-[#1d1c1d]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1c1d]/8 font-inter text-[12px] font-semibold text-[#1d1c1d]">
                  0{idx + 1}
                </span>
                {section.title}
              </h3>
              <div className="font-inter text-[14px] leading-[1.6] text-[#5d5d5d] whitespace-pre-line">
                {section.content}
              </div>
            </SurfaceCard>
          ))}
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
