
import React from 'react';

interface CodeViewerProps {
  code: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  const highlightSyntax = (line: string) => {
    // Basic syntax highlighting
    line = line.replace(/\b(import|from|def|if|else|for|in|return|class|pass|__name__|==|"__main__:")\b/g, '<span class="text-pink-400">$1</span>');
    line = line.replace(/\b(pd|np|math|True|False|None|self)\b/g, '<span class="text-sky-400">$1</span>');
    line = line.replace(/#.*$/g, '<span class="text-gray-500">$&</span>');
    line = line.replace(/(".*?"|'.*?')/g, '<span class="text-green-400">$1</span>');
    line = line.replace(/([\w]+)\(/g, '<span class="text-yellow-400">$1</span>(');
    return line;
  };

  return (
    <div className="p-4 font-mono text-sm bg-gray-800 h-full overflow-auto">
      <pre>
        <code>
          {code.trim().split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-gray-600 w-8 text-right pr-4 select-none">{i + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: highlightSyntax(line) }} />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

export default CodeViewer;
