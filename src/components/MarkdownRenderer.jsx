/** Renders an array of bold segments inline. */
function BoldText({ segments }) {
  return (
    <>
      {segments.map((seg, i) =>
        seg.bold
          ? <strong key={i} className="font-semibold text-slate-800">{seg.text}</strong>
          : <span key={i}>{seg.text}</span>
      )}
    </>
  );
}

/**
 * Renders a content array (from parseMarkdown) into styled HTML.
 * Groups consecutive bullets/numbered items into their list elements.
 */
export default function MarkdownRenderer({ content, showCursor = false }) {
  if (!content?.length) return null;

  const nodes = [];
  let i = 0;

  while (i < content.length) {
    const item = content[i];

    if (item.type === 'bullet') {
      // Collect consecutive bullets into one <ul>
      const bullets = [];
      while (i < content.length && content[i].type === 'bullet') {
        bullets.push(content[i]);
        i++;
      }
      nodes.push(
        <ul key={`ul-${nodes.length}`} className="space-y-1.5 mb-3">
          {bullets.map((b, j) => {
            const isLast = j === bullets.length - 1;
            return (
              <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" aria-hidden="true" />
                <span>
                  <BoldText segments={b.segments} />
                  {isLast && showCursor && <span className="streaming-cursor" aria-hidden="true" />}
                </span>
              </li>
            );
          })}
        </ul>
      );
    } else if (item.type === 'numbered') {
      // Collect consecutive numbered items into one <ol>
      const items = [];
      while (i < content.length && content[i].type === 'numbered') {
        items.push(content[i]);
        i++;
      }
      nodes.push(
        <ol key={`ol-${nodes.length}`} className="space-y-1.5 mb-3">
          {items.map((n, j) => {
            const isLast = j === items.length - 1;
            return (
              <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-amber-500 font-semibold tabular-nums flex-shrink-0 min-w-[1.25rem]">
                  {n.number}.
                </span>
                <span>
                  <BoldText segments={n.segments} />
                  {isLast && showCursor && <span className="streaming-cursor" aria-hidden="true" />}
                </span>
              </li>
            );
          })}
        </ol>
      );
    } else {
      // paragraph
      const isLast = i === content.length - 1;
      nodes.push(
        <p key={`p-${nodes.length}`} className="text-sm text-slate-700 mb-2 leading-relaxed">
          <BoldText segments={item.segments} />
          {isLast && showCursor && <span className="streaming-cursor" aria-hidden="true" />}
        </p>
      );
      i++;
    }
  }

  return <>{nodes}</>;
}
