/**
 * ============================================================
 * ADO CLAUDE PROXY — Netlify Function
 * netlify/functions/ado-proxy.js
 *
 * AI Defence Operations — HES Consultancy International
 * hes-consultancy-international.com
 *
 * Based on: hci claude-proxy.js (HCI platform)
 *
 * ENDPOINTS (same function, action param):
 *   POST /.netlify/functions/ado-proxy
 *        { action: "claude", ... }  → Anthropic API
 *        { action: "slack",  ... }  → Slack webhook (operational alerts)
 *
 * ENVIRONMENT VARIABLES (Netlify dashboard):
 *   ANTHROPIC_API_KEY     → required
 *   SLACK_WEBHOOK_URL     → optional, for operational alerts
 *
 * ADO additions vs HCI proxy:
 *   - Higher MAX_TOKENS (8192) for OPORD generation
 *   - Sonnet model default (better quality for defence context)
 *   - Audit logging per call (module + action type)
 *   - ADO-specific ALLOWED_ORIGINS
 * ============================================================
 */

const ANTHROPIC_API_URL  = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION  = '2023-06-01';
const DEFAULT_MODEL      = 'claude-sonnet-4-6';
const MAX_TOKENS         = 8192;

const ALLOWED_ORIGINS = [
  'https://aidefenceoperations.netlify.app',
  'https://ai-defence-operations.hes-consultancy-international.com',
  'http://localhost:5173',
  'http://localhost:8888',
];

// Basic in-memory rate limiter (resets on cold start — same as HCI proxy)
const rateLimitMap = new Map();
const RATE_LIMIT   = 30;
const RATE_WINDOW  = 60000;

// ── Main handler ─────────────────────────────────────────────
exports.handler = async function (event, context) {
  const origin      = event.headers.origin || event.headers.Origin || '';
  const corsHeaders = getCORSHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' }, corsHeaders);
  }

  const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  if (isRateLimited(clientIP)) {
    return respond(429, { error: 'Too many requests. Please wait a moment.' }, corsHeaders);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { error: 'Invalid JSON body' }, corsHeaders);
  }

  // ADO audit log — module + action type
  console.log(`[ADO Proxy] action=${body.action || 'claude'} module=${body.module || 'unknown'} ip=${clientIP}`);

  const action = body.action || 'claude';

  try {
    if (action === 'claude') return await handleClaude(body, corsHeaders);
    if (action === 'slack')  return await handleSlack(body, corsHeaders);
    return respond(400, { error: 'Unknown action: ' + action }, corsHeaders);
  } catch (err) {
    console.error('[ADO Proxy] Unhandled error:', err.message);
    return respond(500, {
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Please try again',
    }, corsHeaders);
  }
};

// ── Claude handler ───────────────────────────────────────────
async function handleClaude(body, corsHeaders) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('[ADO Proxy] ANTHROPIC_API_KEY not set');
    return respond(500, {
      error: 'API key not configured',
      hint:  'Set ANTHROPIC_API_KEY in Netlify Environment Variables',
    }, corsHeaders);
  }

  const anthropicBody = {
    model:       body.model       || DEFAULT_MODEL,
    max_tokens:  Math.min(body.max_tokens || MAX_TOKENS, MAX_TOKENS),
    messages:    body.messages    || [],
    system:      body.system      || undefined,
    temperature: typeof body.temperature === 'number'
      ? Math.min(Math.max(body.temperature, 0), 1)
      : undefined,
  };

  // Remove undefined keys
  Object.keys(anthropicBody).forEach((k) => {
    if (anthropicBody[k] === undefined) delete anthropicBody[k];
  });

  if (!Array.isArray(anthropicBody.messages) || anthropicBody.messages.length === 0) {
    return respond(400, { error: 'messages array is required and must not be empty' }, corsHeaders);
  }

  const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(anthropicBody),
  });

  const anthropicData = await anthropicResponse.json();

  if (!anthropicResponse.ok) {
    console.error('[ADO Proxy] Anthropic error:', anthropicResponse.status, anthropicData);
    return respond(anthropicResponse.status, {
      error:   'Anthropic API error',
      status:  anthropicResponse.status,
      details: anthropicData?.error?.message || 'Unknown error',
    }, corsHeaders);
  }

  return respond(200, anthropicData, corsHeaders);
}

// ── Slack handler (operational alerts) ──────────────────────
async function handleSlack(body, corsHeaders) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return respond(200, { ok: true, skipped: 'SLACK_WEBHOOK_URL not configured' }, corsHeaders);
  }

  const { alertType, operation, sector, severity, message } = body;
  const severityEmoji = severity === 'critical' ? '🚨' : severity === 'high' ? '⚡' : '⚠️';

  const slackPayload = {
    text: `${severityEmoji} ADO Operationeel Alert`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${severityEmoji} ADO — ${alertType || 'Alert'}`, emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Operatie*\n${operation || 'Onbekend'}` },
          { type: 'mrkdwn', text: `*Sector*\n${sector || '—'}` },
          { type: 'mrkdwn', text: `*Ernst*\n${severity || 'medium'}` },
          { type: 'mrkdwn', text: `*Bericht*\n${message || '—'}` },
        ],
      },
      {
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: `ADO Intelligence · ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}`,
        }],
      },
    ],
  };

  const slackResponse = await fetch(webhookUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(slackPayload),
  });

  if (!slackResponse.ok) {
    return respond(500, { error: 'Slack webhook failed' }, corsHeaders);
  }

  return respond(200, { ok: true, sent: true }, corsHeaders);
}

// ── Helpers ───────────────────────────────────────────────────
function getCORSHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
    'Content-Type':                 'application/json',
  };
}

function respond(status, body, headers = {}) {
  return {
    statusCode: status,
    headers:    { 'Content-Type': 'application/json', ...headers },
    body:       JSON.stringify(body),
  };
}

function isRateLimited(ip) {
  const now  = Date.now();
  const data = rateLimitMap.get(ip) || { count: 0, windowStart: now };
  if (now - data.windowStart > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (data.count >= RATE_LIMIT) return true;
  data.count++;
  rateLimitMap.set(ip, data);
  return false;
}
