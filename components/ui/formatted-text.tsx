export function FormattedText({ text, className = '' }: { text: string; className?: string }) {
  const paragraphs = text.split('\n').filter(Boolean);
  const decodeEntities = (str: string) =>
    str.replace(/&amp;/g, '&')
       .replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>')
       .replace(/&quot;/g, '"')
       .replace(/&#039;/g, "'");
  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: decodeEntities(p) }}
        />
      ))}
    </div>
  );
}
