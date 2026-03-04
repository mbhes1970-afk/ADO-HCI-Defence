// ============================================================
// ADO THEME — AI Defence Operations
// HES Consultancy International
// Based on HCI theme structure (ThemeConfig pattern from CMOFMO)
// ============================================================

export interface ThemeConfig {
  id: string;
  name: string;
  tagline: string;
  shortName: string;
  domain: string;
  logoUrl: string;
  logoWhiteUrl: string;
  contactEmail: string;
  websiteUrl: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDim: string;
    accent: string;
    bg: string;
    bgCard: string;
    bgElevated: string;
    border: string;
    text: string;
    textDim: string;
    textBright: string;
    white: string;
    success: string;
    warning: string;
    error: string;
    // ADO-specific
    operational: string;
    threat: string;
    intel: string;
    critical: string;
  };
}

export const adoTheme: ThemeConfig = {
  id: 'ado',
  name: 'AI Defence Operations',
  tagline: 'Nxt Era Solutions · Dual-Use Platform',
  shortName: 'ADO',
  domain: 'aidefenceoperations.netlify.app',
  logoUrl: '/logos/hci-logo-gold.svg',
  logoWhiteUrl: '/logos/hci-logo-white.svg',
  contactEmail: 'mbhes@hes-consultancy-international.com',
  websiteUrl: 'https://hes-consultancy-international.com',
  colors: {
    // HCI brand (gold)
    primary:      '#c8a55a',
    primaryLight: '#e0c882',
    primaryDim:   'rgba(200,165,90,0.12)',
    accent:       '#e0c882',
    // Backgrounds (darker than base HCI for military feel)
    bg:           '#06070a',
    bgCard:       '#0d0f14',
    bgElevated:   '#13151c',
    // Borders & text
    border:       'rgba(255,255,255,0.06)',
    text:         '#a8a6b4',
    textDim:      '#5e5d6a',
    textBright:   '#f0eef5',
    white:        '#ffffff',
    // Semantic
    success:      '#22c55e',
    warning:      '#f59e0b',
    error:        '#ef4444',
    // ADO military status
    operational:  '#22c55e',   // OPERATIONAL — green
    threat:       '#f59e0b',   // SUBSTANTIAL threat — amber
    intel:        '#60a5fa',   // Intel sources — blue
    critical:     '#ef4444',   // CRITICAL / BREACH — red
  },
};
