
import React, { useEffect, useRef } from 'react';

interface TerminalProps {
  lines: string[];
}

const Terminal: React.FC<TerminalProps> = ({ lines }) => {
  const endOfTerminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="font-mono text-sm text-gray-300 w-full h-full overflow-y-auto">
      {lines.map((line, index) => (
        <div key={index} className="flex">
          <span className="text-green-400 mr-2">$</span>
          <p className="whitespace-pre-wrap">{line}</p>
        </div>
      ))}
      <div ref={endOfTerminalRef} />
    </div>
  );
};

export default Terminal;
