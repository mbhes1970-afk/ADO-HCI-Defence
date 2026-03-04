// ============================================================
// aiService.ts — ADO
// Calls the Netlify ado-proxy.js function.
// All Claude calls go through here — one place to update model/config.
// ============================================================

import type { AICallOptions } from '../config/types';

const PROXY_URL = '/.netlify/functions/ado-proxy';

export async function callAI(options: AICallOptions): Promise<string> {
  const response = await fetch(PROXY_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:      'claude',
      model:       options.model       || 'claude-sonnet-4-5-20250929',
      max_tokens:  options.maxTokens   || 4096,
      temperature: options.temperature ?? 0.3,
      system:      options.system,
      messages:    options.messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.details || `AI call failed: ${response.status}`);
  }

  const data = await response.json();

  // Extract text from Anthropic response format
  const text = data.content
    ?.filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('\n') || '';

  return text;
}
