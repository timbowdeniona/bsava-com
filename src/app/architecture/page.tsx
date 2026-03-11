import fs from 'fs';
import path from 'path';
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
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-[1360px] mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-bsava-navy mb-4 tracking-tight">
            System Architecture
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            A comprehensive overview of the BSAVA MACH (Microservices, API-first, Cloud-native, Headless) ecosystem, 
            detailing the integration between Next.js, Contentful, Pimcore, and third-party services.
          </p>
        </div>

        {/* Diagram Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-bsava-navy uppercase tracking-widest border-l-4 border-bsava-blue pl-4">
              Flowchart Visualization
            </h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-bsava-blue/10 text-bsava-blue text-xs font-bold rounded-full">MACH Architecture</span>
              <span className="px-3 py-1 bg-bsava-orange/10 text-bsava-orange text-xs font-bold rounded-full">Live Reference</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-8 lg:p-12 overflow-x-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
              <Mermaid chart={mermaidChart} />
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <h3 className="text-lg font-bold text-bsava-navy mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-bsava-blue/10 text-bsava-blue flex items-center justify-center text-xs">
                  0{idx + 1}
                </span>
                {section.title}
              </h3>
              <div className="text-slate-600 leading-relaxed text-sm font-inter whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
