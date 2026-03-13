'use client';

import { useEffect, useRef, useState } from 'react';

export default function Mermaid({ chart }: { chart: string }) {
  const [isClient, setIsClient] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && ref.current) {
      import('mermaid').then((mermaid) => {
        mermaid.default.initialize({
          startOnLoad: true,
          theme: 'neutral',
          themeVariables: {
            primaryColor: '#0073b8',
            primaryTextColor: '#fff',
            primaryBorderColor: '#001f36',
            lineColor: '#334155', // slate-700 for better visibility of lines
            secondaryColor: '#ffa347',
            tertiaryColor: '#59abd3',
            fontFamily: 'var(--font-inter), sans-serif',
            // Sequence diagram specific
            signalColor: '#334155',
            signalTextColor: '#334155',
            labelTextColor: '#334155',
            loopTextColor: '#334155',
            noteTextColor: '#334155',
            noteBkgColor: '#fffbeb', // amber-50
          },
          securityLevel: 'loose',
        });
        
        // Clear previous content and render
        ref.current!.innerHTML = chart;
        mermaid.default.contentLoaded();
        
        // Re-render if chart changes
        const renderDiagram = async () => {
          if (ref.current) {
            const { svg } = await mermaid.default.render(
              `mermaid-${Math.random().toString(36).substr(2, 9)}`,
              chart
            );
            ref.current.innerHTML = svg;
          }
        };
        renderDiagram();
      }).catch(err => console.error('Mermaid render error:', err));
    }
  }, [isClient, chart]);

  if (!isClient) {
    return <div className="animate-pulse bg-slate-100 h-64 rounded-xl flex items-center justify-center text-slate-400">Loading diagram...</div>;
  }

  return (
    <div 
      className="mermaid bg-white p-8 rounded-xl flex justify-center overflow-auto" 
      ref={ref} 
    />
  );
}
