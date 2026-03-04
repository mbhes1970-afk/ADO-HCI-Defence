// ============================================================
// i18n — ADO
// Same pattern as CMOFMO i18n.ts (LanguageContext + t() helper)
// ============================================================

import { createContext, useContext } from 'react';
import type { Language } from './types';

export const translations = {
  // ── Navigation ──────────────────────────────────────────
  'nav.dashboard':     { nl: 'Dashboard',       en: 'Dashboard' },
  'nav.missionBrief':  { nl: 'Missie Briefing', en: 'Mission Brief' },
  'nav.intel':         { nl: 'Intel Analist',   en: 'Intel Analyst' },
  'nav.fieldReport':   { nl: 'Veldrapport',     en: 'Field Report' },
  'nav.training':      { nl: 'Training Sim',    en: 'Training Sim' },

  // ── Top bar ─────────────────────────────────────────────
  'topbar.status':     { nl: 'OPERATIONEEL',    en: 'OPERATIONAL' },
  'topbar.platform':   { nl: 'Nxt Era Solutions • Dual-Use Platform', en: 'Nxt Era Solutions • Dual-Use Platform' },
  'topbar.prototype':  { nl: 'PROTOTYPE DEMO',  en: 'PROTOTYPE DEMO' },

  // ── Dashboard ───────────────────────────────────────────
  'dash.title':              { nl: 'Operationeel Dashboard', en: 'Operational Dashboard' },
  'dash.activeMissions':     { nl: 'Actieve Missies',        en: 'Active Missions' },
  'dash.aiReports':          { nl: 'AI Rapporten',           en: 'AI Reports' },
  'dash.intelSources':       { nl: 'Intel Bronnen',          en: 'Intel Sources' },
  'dash.timeSaved':          { nl: 'Tijd Bespaard',          en: 'Time Saved' },
  'dash.perDay':             { nl: 'Per dag',                en: 'Per day' },
  'dash.todaysMissions':     { nl: "Missies Vandaag",        en: "Today's Missions" },
  'dash.recentActivity':     { nl: 'Recente Activiteit',     en: 'Recent Activity' },

  // ── Mission status ──────────────────────────────────────
  'status.operational': { nl: 'OPERATIONEEL', en: 'OPERATIONAL' },
  'status.ready':       { nl: 'Gereed',       en: 'Ready' },
  'status.pending':     { nl: 'Wachtend',     en: 'Pending' },
  'status.scheduled':   { nl: 'Gepland',      en: 'Scheduled' },
  'status.complete':    { nl: 'Afgerond',     en: 'Complete' },

  // ── Threat levels ────────────────────────────────────────
  'threat.low':        { nl: 'LAAG',        en: 'LOW' },
  'threat.moderate':   { nl: 'MATIG',       en: 'MODERATE' },
  'threat.substantial':{ nl: 'AANZIENLIJK', en: 'SUBSTANTIAL' },
  'threat.severe':     { nl: 'ERNSTIG',     en: 'SEVERE' },
  'threat.critical':   { nl: 'KRITIEK',     en: 'CRITICAL' },

  // ── Mission Brief ────────────────────────────────────────
  'brief.tab.preBrief':    { nl: 'Voorbereiding',    en: 'Pre-Brief' },
  'brief.tab.live':        { nl: 'Live Briefing',    en: 'Live Briefing' },
  'brief.tab.opord':       { nl: 'OPORD',            en: 'OPORD' },
  'brief.tab.postBrief':   { nl: 'Na-Briefing',      en: 'Post-Brief' },
  'brief.startBriefing':   { nl: 'Start Briefing →', en: 'Start Briefing →' },
  'brief.aiAssistant':     { nl: 'AI Missie Assistent', en: 'AI Mission Assistant' },
  'brief.aiAssessment':    { nl: 'AI Situatiebeoordeling', en: 'AI Situation Assessment' },
  'brief.missionSummary':  { nl: 'Missie Samenvatting',    en: 'Mission Summary' },
  'brief.operation':       { nl: 'Operatie',    en: 'Operation' },
  'brief.type':            { nl: 'Type',        en: 'Type' },
  'brief.dtg':             { nl: 'DTG',         en: 'DTG' },
  'brief.commander':       { nl: 'Commandant',  en: 'Commander' },
  'brief.threatLevel':     { nl: 'Dreigingsniveau', en: 'Threat Level' },

  // ── Intel Analyst ────────────────────────────────────────
  'intel.tab.sources':     { nl: 'Bronnen',      en: 'Sources' },
  'intel.tab.analysis':    { nl: 'Analyse',      en: 'Analysis' },
  'intel.tab.correlation': { nl: 'Correlatie',   en: 'Correlation' },
  'intel.tab.intsum':      { nl: 'INTSUM',       en: 'INTSUM' },
  'intel.selectSource':    { nl: 'Selecteer een bron om te analyseren', en: 'Select a source to analyze' },
  'intel.skipCorrelation': { nl: 'Ga naar Correlatie', en: 'Skip to Correlation' },

  // ── Field Report ─────────────────────────────────────────
  'field.tab.record':     { nl: 'Opname',       en: 'Record' },
  'field.tab.transcribe': { nl: 'Transcribeer', en: 'Transcribe' },
  'field.tab.aiParse':    { nl: 'AI Verwerk',   en: 'AI Parse' },
  'field.tab.salute':     { nl: 'SALUTE',       en: 'SALUTE' },
  'field.tapToRecord':    { nl: 'Tik op microfoon om opname te starten', en: 'Tap microphone to start recording' },
  'field.processToSalute':{ nl: 'Verwerk naar SALUTE', en: 'Process to SALUTE' },

  // ── Training Sim ─────────────────────────────────────────
  'training.selectScenario': { nl: 'Selecteer een scenario om te beginnen', en: 'Select a scenario to begin' },
  'training.competency':     { nl: 'Competentietracker', en: 'Competency Tracker' },
  'training.completed':      { nl: 'Afgerond',           en: 'Completed' },
  'training.score':          { nl: 'Score',              en: 'Score' },
  'training.debrief':        { nl: 'Debrief',            en: 'Debrief' },
  'training.decision':       { nl: 'Beslismoment',       en: 'Decision point' },
  'training.playAgain':      { nl: 'Opnieuw Spelen',     en: 'Play Again' },
  'training.newScenario':    { nl: 'Nieuw Scenario',     en: 'New Scenario' },

  // ── Shared / General ─────────────────────────────────────
  'general.export':        { nl: 'Exporteer',        en: 'Export' },
  'general.save':          { nl: 'Opslaan',          en: 'Save' },
  'general.cancel':        { nl: 'Annuleer',         en: 'Cancel' },
  'general.generating':    { nl: 'Genereren...',     en: 'Generating...' },
  'general.aiGenerated':   { nl: 'AI Gegenereerd',   en: 'AI Generated' },
  'general.restricted':    { nl: 'BEPERKT',          en: 'RESTRICTED' },
  'general.confidential':  { nl: 'VERTROUWELIJK',    en: 'CONFIDENTIAL' },
  'general.secret':        { nl: 'GEHEIM',           en: 'SECRET' },
  'general.loading':       { nl: 'Laden...',         en: 'Loading...' },
  'general.error':         { nl: 'Fout opgetreden',  en: 'An error occurred' },
  'general.contact':       { nl: 'Contact',          en: 'Contact' },
} as const;

export type TranslationKey = keyof typeof translations;

/** Drop-in t() helper — same API as CMOFMO */
export function t(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] ?? key;
}

// ── React context (identical pattern to CMOFMO) ──────────────
export const LanguageContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
}>({ lang: 'nl', setLang: () => {} });

export const useLanguage = (): { lang: Language; setLang: (l: Language) => void } =>
  useContext(LanguageContext);
