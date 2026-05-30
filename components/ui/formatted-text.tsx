import { ReactNode } from 'react';

type FormattedTextProps = {
  text: string;
  className?: string;
  asHeading?: boolean;
};

function detectBlocks(text: string): ReactNode[] {
  const blocks = text.split('\n\n').filter(Boolean);
  return blocks.map((block, i) => {
    const lines = block.split('\n').filter(Boolean);
    if (lines.length === 1) {
      if (lines[0].length < 50 && !lines[0].includes('•')) {
        return <h4 key={i} className="font-serif text-lg text-foreground">{lines[0]}</h4>;
      }
      return <p key={i} className="text-muted-foreground leading-relaxed">{lines[0]}</p>;
    }
    if (lines.length > 1) {
      const hasHeader = lines[0].length < 50;
      const rest = hasHeader ? lines.slice(1) : lines;
      const header = hasHeader ? lines[0] : null;
      return (
        <div key={i}>
          {header && <h4 className="font-serif text-lg text-foreground mb-2">{header}</h4>}
          <div className="space-y-1.5">
            {rest.map((line, j) => (
              <div key={j} className="flex items-start gap-2 text-muted-foreground">
                <span className="text-forest-500 mt-1.5 shrink-0">•</span>
                <span>{line.replace(/^•\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return <p key={i} className="text-muted-foreground leading-relaxed">{lines.join(' ')}</p>;
  });
}

export function FormattedText({ text, className = '' }: FormattedTextProps) {
  return (
    <div className={`space-y-5 ${className}`}>
      {detectBlocks(text)}
    </div>
  );
}
