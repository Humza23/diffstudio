/**
 * Splits text on ** markers, returning segments with bold flag.
 * e.g. "hello **world** foo" → [{bold:false,text:"hello "},{bold:true,text:"world"},{bold:false,text:" foo"}]
 */
function parseBold(text) {
  const parts = text.split('**');
  return parts.map((part, i) => ({ bold: i % 2 === 1, text: part })).filter((s) => s.text !== '');
}

/**
 * Parses a single content line into a typed object.
 */
function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  if (/^[-*] /.test(trimmed)) {
    const text = trimmed.slice(2).trim();
    return { type: 'bullet', text, segments: parseBold(text) };
  }

  const numberedMatch = trimmed.match(/^(\d+)\. (.*)/);
  if (numberedMatch) {
    const text = numberedMatch[2].trim();
    return { type: 'numbered', number: parseInt(numberedMatch[1], 10), text, segments: parseBold(text) };
  }

  return { type: 'paragraph', text: trimmed, segments: parseBold(trimmed) };
}

/**
 * Parses streamed markdown text into an array of section objects:
 * [{ header: string, content: ContentLine[] }]
 *
 * Robust to partial lines — only complete lines (with \n or at end of input)
 * after a full "## " header trigger a new section.
 */
export function parseMarkdown(rawText) {
  if (!rawText) return [];

  const lines = rawText.split('\n');
  const sections = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      const header = line.slice(3).trim();
      if (!header) continue; // skip if header text hasn't arrived yet
      if (current) sections.push(current);
      current = { header, content: [] };
    } else if (current) {
      const parsed = parseLine(line);
      if (parsed) current.content.push(parsed);
    }
  }

  if (current) sections.push(current);
  return sections;
}
