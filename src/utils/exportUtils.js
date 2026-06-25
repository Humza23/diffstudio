/**
 * Strips markdown formatting to produce clean plain text.
 */
function toPlainText(rawText) {
  return rawText
    .replace(/^## /gm, '')       // section headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold markers
    .replace(/^[-*] /gm, '• ')   // bullets → unicode bullet
    .trim();
}

/**
 * Copies the artifact as plain text to the clipboard.
 * Returns a promise that resolves to true on success.
 */
export async function copyToClipboard(rawText) {
  const plain = toPlainText(rawText);
  await navigator.clipboard.writeText(plain);
}

/**
 * Downloads the artifact as a .txt file.
 */
export function exportAsTxt(rawText, grade, topic) {
  const plain = toPlainText(rawText);
  const timestamp = new Date().toISOString().slice(0, 10);
  const safeTopic = topic.replace(/[^a-z0-9]/gi, '_').slice(0, 30);
  const filename = `DiffStudio_Grade${grade}_${safeTopic}_${timestamp}.txt`;
  const blob = new Blob([plain], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Attempts to open the artifact in a new Google Doc.
 * Falls back to clipboard copy if the URL scheme doesn't accept a body param.
 */
export async function openInGoogleDocs(rawText) {
  const plain = toPlainText(rawText);
  const encoded = encodeURIComponent(plain);
  // Google Docs "create" URL — body param is not reliably supported in all browsers
  const url = `https://docs.google.com/document/create?title=DiffStudio%20Artifact&body=${encoded}`;
  try {
    window.open(url, '_blank');
  } catch {
    await navigator.clipboard.writeText(plain);
    throw new Error('clipboard');
  }
}
