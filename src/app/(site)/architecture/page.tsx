import fs from 'fs';
import path from 'path';
import Mermaid from '../components/Mermaid';

type ContentBlock = {
  type: 'markdown' | 'mermaid' | 'h1' | 'h2' | 'h3' | 'hr';
  content: string;
};

export default async function ArchitecturePage() {
  const filePath = path.join(process.cwd(), 'BSAVA_MACH_ARCHITECTURE_DIAGRAM.md');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Improved parser to handle multiple types of blocks in order
  const parseContent = (content: string): ContentBlock[] => {
    const blocks: ContentBlock[] = [];
    const lines = content.split('\n');
    let currentMarkdown = '';
    let inMermaid = false;
    let mermaidContent = '';

    const pushMarkdown = () => {
      if (currentMarkdown.trim()) {
        blocks.push({ type: 'markdown', content: currentMarkdown.trim() });
        currentMarkdown = '';
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```mermaid')) {
        pushMarkdown();
        inMermaid = true;
        mermaidContent = '';
        continue;
      }

      if (inMermaid) {
        if (line.trim() === '```') {
          inMermaid = false;
          blocks.push({ type: 'mermaid', content: mermaidContent.trim() });
          continue;
        }
        mermaidContent += line + '\n';
        continue;
      }

      if (line.startsWith('# ')) {
        pushMarkdown();
        blocks.push({ type: 'h1', content: line.replace('# ', '').trim() });
      } else if (line.startsWith('## ')) {
        pushMarkdown();
        blocks.push({ type: 'h2', content: line.replace('## ', '').trim() });
      } else if (line.startsWith('### ')) {
        pushMarkdown();
        blocks.push({ type: 'h3', content: line.replace('### ', '').trim() });
      } else if (line.trim() === '---') {
        pushMarkdown();
        blocks.push({ type: 'hr', content: '' });
      } else {
        currentMarkdown += line + '\n';
      }
    }
    pushMarkdown();
    return blocks;
  };

  const blocks = parseContent(fileContent);

  return (
    <div className="min-h-screen bg-[#f8fbff]">
      {/* Dynamic Header */}
      <div className="bg-bsava-navy py-16 px-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-bsava-blue text-white text-xs font-bold uppercase tracking-widest rounded">Technical Doc</span>
            <div className="h-px flex-1 bg-white/20"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            System <span className="text-bsava-blue">Architecture</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed font-light">
            A comprehensive overview of the BSAVA MACH ecosystem, detailing the integration between 
            Next.js, Contentful, Pimcore, and Commerce Layer.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-8 py-16">
        <div className="space-y-12">
          {blocks.map((block, idx) => {
            switch (block.type) {
              case 'h1':
                return null; // Handled in hero
              case 'h2':
                return (
                  <div key={idx} className="pt-12 first:pt-0">
                    <h2 className="text-3xl font-black text-bsava-navy mb-6 flex items-center gap-4">
                      <span className="w-12 h-1 bg-bsava-blue rounded-full"></span>
                      {block.content}
                    </h2>
                  </div>
                );
              case 'h3':
                return (
                  <h3 key={idx} className="text-xl font-bold text-bsava-navy mt-10 mb-4 pl-4 border-l-4 border-bsava-orange">
                    {block.content}
                  </h3>
                );
              case 'hr':
                return <hr key={idx} className="border-slate-200 my-16" />;
              case 'mermaid':
                return (
                  <div key={idx} className="my-8 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
                    <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logic Visualization</span>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                      </div>
                    </div>
                    <div className="p-4 md:p-8 lg:p-12 overflow-x-auto">
                      <Mermaid chart={block.content} />
                    </div>
                  </div>
                );
              case 'markdown':
                const processMarkdown = (text: string) => {
                  // Bold processing
                  const processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  
                  // Handle bulleted lists
                  const lines = processed.split('\n');
                  const result = [];
                  let inList = false;

                  for (const line of lines) {
                    if (line.trim().startsWith('- ')) {
                      if (!inList) {
                        result.push('<ul class="list-disc pl-6 space-y-2 my-4 text-slate-600">');
                        inList = true;
                      }
                      result.push('<li class="leading-relaxed">' + line.trim().substring(2) + '</li>');
                    } else {
                      if (inList) {
                        result.push('</ul>');
                        inList = false;
                      }
                      if (line.trim()) {
                        result.push('<p class="text-slate-600 leading-relaxed mb-4">' + line + '</p>');
                      }
                    }
                  }
                  if (inList) result.push('</ul>');
                  return result.join('');
                };

                return (
                  <div 
                    key={idx} 
                    className="prose prose-slate max-w-none text-lg font-inter"
                    dangerouslySetInnerHTML={{ __html: processMarkdown(block.content) }}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="bg-white border-t border-slate-200 py-12 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-400 text-sm">
            Generated from <code className="bg-slate-100 px-2 py-1 rounded text-bsava-navy">BSAVA_MACH_ARCHITECTURE_DIAGRAM.md</code>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-bsava-blue"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">MACH Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-bsava-orange"></div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Live Reference</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
