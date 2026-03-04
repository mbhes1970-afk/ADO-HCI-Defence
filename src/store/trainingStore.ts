// ============================================================
// trainingStore — ADO
// Training simulation state & competency scores
// ============================================================

import { create } from 'zustand';
import type { TrainingScenario, CompetencyScore } from '../config/types';

const defaultScenarios: TrainingScenario[] = [
  {
    id: 'fp-breach',
    title:       { nl: 'Troepenbescherming Inbreuk', en: 'Force Protection Breach' },
    description: {
      nl: 'Perimeter inbreuk gedetecteerd. Escalerende dreiging. Meerlaagse respons vereist. 3 beslismomenten.',
      en: 'Perimeter breach detected. Escalating threats. Multi-layered response required. 3 decision points.',
    },
    durationMinutes: 45,
    icon: '🛡️',
    decisionPoints: 3,
  },
  {
    id: 'intel-pressure',
    title:       { nl: 'Intel Analyse Onder Druk', en: 'Intel Analysis Under Pressure' },
    description: {
      nl: 'Tegenstrijdige rapporten. Tijdkritieke beslissing. Commandant heeft beoordeling nodig in 15 minuten.',
      en: 'Conflicting reports. Time-critical decision. Commander needs assessment in 15 minutes.',
    },
    durationMinutes: 60,
    icon: '🔍',
    decisionPoints: 4,
  },
  {
    id: 'mass-casualty',
    title:       { nl: 'Massa Slachtoffer Respons', en: 'Mass Casualty Response' },
    description: {
      nl: 'IED-detonatie. Meerdere slachtoffers. MEDEVAC coördinatie onder vuur. Triage beslissingen.',
      en: 'IED detonation. Multiple casualties. MEDEVAC coordination under fire. Triage decisions.',
    },
    durationMinutes: 90,
    icon: '🚨',
    decisionPoints: 5,
  },
];

const defaultCompetencies: CompetencyScore[] = [
  { id: 'decision-speed', label: { nl: 'Beslissnelheid', en: 'Decision Speed' },        score: 87, trend: 'up',   delta: 12 },
  { id: 'sit-awareness',  label: { nl: 'Situatiebewustzijn', en: 'Situation Awareness' }, score: 92, trend: 'up',   delta: 5  },
  { id: 'communication',  label: { nl: 'Communicatie', en: 'Communication' },              score: 78, trend: 'down', delta: 3  },
];

interface TrainingState {
  scenarios: TrainingScenario[];
  activeScenario: TrainingScenario | null;
  setActiveScenario: (s: TrainingScenario | null) => void;
  competencies: CompetencyScore[];
  completedCount: number;
  completedDelta: number;
}

export const useTrainingStore = create<TrainingState>(() => ({
  scenarios:        defaultScenarios,
  activeScenario:   null,
  setActiveScenario: (s) => useTrainingStore.setState({ activeScenario: s }),
  competencies:     defaultCompetencies,
  completedCount:   14,
  completedDelta:   4,
}));
