import DOMPurify from 'dompurify';

export function FormattedText({ text, className = '' }: { text: string; className?: string }) {
  const paragraphs = text.split('\n').filter(Boolean);
  const decodeAndSanitize = (str: string) => {
    const decoded = str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
    return DOMPurify.sanitize(decoded, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'], ALLOWED_ATTR: ['href', 'target', 'rel'] });
  };
  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: decodeAndSanitize(p) }}
        />
      ))}
    </div>
  );
}
