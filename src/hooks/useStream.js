import { useState } from 'react';

function buildSystemPrompt(profile) {
  const lines = [];
  if (
    profile?.classSize ||
    profile?.ellPercent > 0 ||
    profile?.iepPercent > 0 ||
    profile?.scaffoldingStyle ||
    profile?.standingAccommodations
  ) {
    const style =
      profile.scaffoldingStyle === 'gradualRelease' ? 'Gradual Release (I do, We do, You do)' :
      profile.scaffoldingStyle === 'inquiryFirst'   ? 'Inquiry-First (productive struggle)' :
      'Flexible (adapts to activity)';

    lines.push('Teacher context:');
    if (profile.classSize)          lines.push(`- Class size: ${profile.classSize} students`);
    if (profile.ellPercent > 0)     lines.push(`- ${profile.ellPercent}% are English Language Learners`);
    if (profile.iepPercent > 0)     lines.push(`- ${profile.iepPercent}% have IEPs or 504 plans`);
    lines.push(`- Preferred scaffolding approach: ${style}`);
    if (profile.standingAccommodations) lines.push(`- Standing accommodations: ${profile.standingAccommodations}`);
  }

  return [
    'You are an expert K-12 math curriculum specialist with deep knowledge of Illustrative Mathematics (IM v.360) and research-backed differentiation strategies. You help teachers create targeted, classroom-ready materials that maintain grade-level rigor while meeting diverse student needs.',
    lines.length ? '\n' + lines.join('\n') : '',
    '\nAlways structure your response using exactly these section headers in this order:',
    '## 🎯 Learning Objective',
    '## 📋 Overview',
    '## 📚 [Mode-specific content based on the selected mode]',
    '## 💡 Teacher Notes',
    '## ⚡ Quick Differentiation Tips',
    '\nRules:',
    '- Be specific and immediately usable — a teacher should be able to use this tomorrow morning',
    '- Use numbered lists for activities and problems',
    '- Use bullet points for teacher notes and tips',
    '- Keep each section focused and scannable',
    '- Do not add extra sections beyond the five above',
    '- Do not add preamble or sign-off text outside the sections',
  ].filter(Boolean).join('\n');
}

function buildUserPrompt({ grade, topic, mode, context }) {
  return [
    `Grade: ${grade}`,
    `Topic: ${topic}`,
    `Mode: ${mode.title} — ${mode.description}`,
    `Request: ${mode.promptHint}`,
    `Classroom context: ${context || 'No additional context provided'}`,
  ].join('\n');
}

function classifyError(err, status) {
  if (status === 401) return 'Invalid API key. Check Settings.';
  if (status === 429) return 'Rate limit reached. Wait a moment and try again.';
  if (status >= 500)  return 'Anthropic API error. Try again.';
  if (status)         return `Request failed (${status}). Try again.`;
  if (err?.name === 'TypeError' || err?.message?.includes('fetch')) {
    return 'Connection failed. Check your internet connection.';
  }
  return err?.message ?? 'Something went wrong. Try again.';
}

export function useStream(apiKey, profile) {
  const [rawText, setRawText]     = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError]         = useState('');

  function reset() {
    setRawText('');
    setError('');
  }

  /** Returns the full accumulated text on success, null on error. */
  async function generate(params) {
    reset();
    setIsStreaming(true);

    let accumulated = '';
    let responseStatus = 0;

    const useProxy = !apiKey && import.meta.env.VITE_USE_PROXY === 'true';
    const model = useProxy ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-6';
    const endpoint = useProxy ? '/api/chat' : 'https://api.anthropic.com/v1/messages';
    const authHeaders = useProxy
      ? {}
      : {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          stream: true,
          system: buildSystemPrompt(profile),
          messages: [{ role: 'user', content: buildUserPrompt(params) }],
        }),
      });

      responseStatus = response.status;

      if (!response.ok) {
        throw new Error(classifyError(null, responseStatus));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // SSE events are separated by double newlines
        const events = chunk.split('\n\n');
        for (const event of events) {
          if (!event.startsWith('data: ')) continue;
          const data = event.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (
              parsed.type === 'content_block_delta' &&
              parsed.delta?.type === 'text_delta'
            ) {
              accumulated += parsed.delta.text;
              setRawText(accumulated);
            }
          } catch {
            // ignore malformed SSE frames
          }
        }
      }

      if (!accumulated) {
        throw new Error('No content received. Try again.');
      }

      return accumulated;

    } catch (err) {
      const msg = classifyError(err, responseStatus);
      setError(msg);
      return null;
    } finally {
      setIsStreaming(false);
    }
  }

  return { generate, isStreaming, rawText, error, reset };
}
