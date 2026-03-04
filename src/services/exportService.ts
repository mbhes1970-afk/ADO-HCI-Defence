// ============================================================
// exportService — ADO shared service
// Centraalised export: JSON, plain text, simulated PDF/DOCX
// Used by: PostBrief, IntSum, SaluteReport, Debrief
// ============================================================

import type { ExportFormat, ClassificationLevel } from '../config/types';

export interface ExportPayload {
  title:          string;
  content:        string;
  classification: ClassificationLevel;
  format:         ExportFormat;
  module:         string;
  dtg?:           string;
  distribution?:  string;
}

function buildHeader(payload: ExportPayload, _lang: 'nl' | 'en'): string {
  const divider = '='.repeat(60);
  const dtg = payload.dtg ?? new Date().toISOString().slice(0, 16).replace('T', ' ') + 'Z';
  return [
    divider,
    `CLASSIFICATIE: ${payload.classification}`,
    `DOCUMENT:      ${payload.title.toUpperCase()}`,
    `MODULE:        ${payload.module.toUpperCase()}`,
    `DTG:           ${dtg}`,
    `SYSTEEM:       AI Defence Operations v1.0`,
    `GENERATOR:     Claude AI (Anthropic)`,
    divider,
    '',
  ].join('\n');
}

function buildFooter(payload: ExportPayload): string {
  return [
    '',
    '='.repeat(60),
    `EINDE DOCUMENT — ${payload.classification}`,
    `Distributie: ${payload.distribution ?? 'Command Staff'}`,
    'HES Consultancy International · hes-consultancy-international.com',
    '='.repeat(60),
  ].join('\n');
}

/** Export as plain text and trigger browser download */
function downloadText(payload: ExportPayload, lang: 'nl' | 'en') {
  const header  = buildHeader(payload, lang);
  const footer  = buildFooter(payload);
  const full    = `${header}\n${payload.content}\n${footer}`;
  const blob    = new Blob([full], { type: 'text/plain;charset=utf-8' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href        = url;
  a.download    = `ADO_${payload.module.toUpperCase()}_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export as JSON */
function downloadJSON(payload: ExportPayload) {
  const data = {
    meta: {
      system:         'AI Defence Operations v1.0',
      classification: payload.classification,
      module:         payload.module,
      dtg:            payload.dtg ?? new Date().toISOString(),
      generator:      'Claude AI (Anthropic)',
      distribution:   payload.distribution ?? 'Command Staff',
    },
    title:   payload.title,
    content: payload.content,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `ADO_${payload.module.toUpperCase()}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Main export dispatcher */
export function exportDocument(payload: ExportPayload, lang: 'nl' | 'en' = 'nl'): void {
  switch (payload.format) {
    case 'json':
      downloadJSON(payload);
      break;
    case 'txt':
      downloadText(payload, lang);
      break;
    case 'pdf':
    case 'docx':
      // In production: generate via server-side. For prototype: export as text.
      downloadText(payload, lang);
      break;
    default:
      downloadText(payload, lang);
  }
}
