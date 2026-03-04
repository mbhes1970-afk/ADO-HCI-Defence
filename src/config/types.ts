// ============================================================
// ADO Types
// AI Defence Operations — HES Consultancy International
// ============================================================

export type Language = 'nl' | 'en';

// ── Navigation ──────────────────────────────────────────────
export type ModuleId =
  | 'dashboard'
  | 'mission-brief'
  | 'intel-analyst'
  | 'field-report'
  | 'training-sim';

// ── Classification ──────────────────────────────────────────
export type ClassificationLevel =
  | 'UNCLASSIFIED'
  | 'RESTRICTED'
  | 'CONFIDENTIAL'
  | 'SECRET';

// ── Operational status ──────────────────────────────────────
export type OperationalStatus =
  | 'OPERATIONAL'
  | 'PENDING'
  | 'SCHEDULED'
  | 'COMPLETE'
  | 'CANCELLED';

// ── Threat level ────────────────────────────────────────────
export type ThreatLevel =
  | 'LOW'
  | 'MODERATE'
  | 'SUBSTANTIAL'
  | 'SEVERE'
  | 'CRITICAL';

// ── Mission ─────────────────────────────────────────────────
export interface Mission {
  id: string;
  code: string;                       // e.g. "NS", "EW"
  name: { nl: string; en: string };
  type: { nl: string; en: string };
  dtg: string;                        // NATO date-time-group
  commander: string;
  threatLevel: ThreatLevel;
  status: OperationalStatus;
  time: string;                       // e.g. "09:00"
  areaOfOperation?: string;
}

// ── Intel source ────────────────────────────────────────────
export type IntelSourceType =
  | 'SIGINT'
  | 'HUMINT'
  | 'IMINT'
  | 'GEOINT'
  | 'OSINT'
  | 'UAV';

export type ReliabilityCode = 'A1' | 'A2' | 'B1' | 'B2' | 'C3' | 'D4';

export interface IntelSource {
  id: string;
  type: IntelSourceType;
  label: { nl: string; en: string };
  subLabel: string;
  reliabilityCode: ReliabilityCode;
  summary: { nl: string; en: string };
  updatedAt: string;
  isLive?: boolean;
  icon: string;
}

// ── Training scenario ───────────────────────────────────────
export interface TrainingScenario {
  id: string;
  title: { nl: string; en: string };
  description: { nl: string; en: string };
  durationMinutes: number;
  icon: string;
  decisionPoints: number;
}

export interface CompetencyScore {
  id: string;
  label: { nl: string; en: string };
  score: number;          // 0–100
  trend: 'up' | 'down' | 'stable';
  delta: number;          // percentage change
}

// ── AI ──────────────────────────────────────────────────────
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AICallOptions {
  system: string;
  messages: AIMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// ── Export ──────────────────────────────────────────────────
export type ExportFormat = 'pdf' | 'docx' | 'json' | 'txt';

export interface ExportOptions {
  format: ExportFormat;
  classification: ClassificationLevel;
  distribution: 'command-staff' | 'unit-level' | 'full';
}
