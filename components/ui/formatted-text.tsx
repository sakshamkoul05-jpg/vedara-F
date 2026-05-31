export function FormattedText({ text, className = '' }: { text: string; className?: string }) {
  const paragraphs = text.split('\n').filter(Boolean);
  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
      ))}
    </div>
  );
}
