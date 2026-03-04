// ============================================================
// missionStore — ADO
// Operational mission data
// ============================================================

import { create } from 'zustand';
import type { Mission } from '../config/types';

const defaultMissions: Mission[] = [
  {
    id: 'ns-001',
    code: 'NS',
    name: { nl: 'Operatie Noordelijk Schild', en: 'Operation Northern Shield' },
    type: { nl: 'Troepenbescherming / Gebiedsbeveiliging', en: 'Force Protection / Area Security' },
    dtg: '310900ZJAN26',
    commander: 'MAJ R. de Groot',
    threatLevel: 'SUBSTANTIAL',
    status: 'OPERATIONAL',
    time: '09:00',
    areaOfOperation: 'NORTH — ACTIVE',
  },
  {
    id: 'ew-001',
    code: 'EW',
    name: { nl: 'Oefening Watchful Eye', en: 'Exercise Watchful Eye' },
    type: { nl: 'ISR coördinatie', en: 'ISR coordination' },
    dtg: '311100ZJAN26',
    commander: 'LTC H. Janssen',
    threatLevel: 'LOW',
    status: 'PENDING',
    time: '11:00',
  },
  {
    id: 'ls-001',
    code: 'LS',
    name: { nl: 'Logistieke Samenvatting', en: 'Logistics Summary' },
    type: { nl: 'Bevoorradingsoverzicht', en: 'Supply review' },
    dtg: '311400ZJAN26',
    commander: 'CPT M. Bakker',
    threatLevel: 'LOW',
    status: 'SCHEDULED',
    time: '14:00',
  },
  {
    id: 'ct-001',
    code: 'CT',
    name: { nl: 'Counter-UAV Briefing', en: 'Counter-UAV Brief' },
    type: { nl: 'Tactische respons', en: 'Tactical response' },
    dtg: '311600ZJAN26',
    commander: 'MAJ R. de Groot',
    threatLevel: 'SUBSTANTIAL',
    status: 'SCHEDULED',
    time: '16:00',
  },
];

interface MissionState {
  missions: Mission[];
  activeMission: Mission | null;
  setActiveMission: (mission: Mission) => void;

  // Stats
  stats: {
    activeMissions: number;
    aiReports: number;
    aiReportsTrend: string;
    intelSources: number;
    intelSourcesDelta: number;
    timeSaved: string;
  };
}

export const useMissionStore = create<MissionState>(() => ({
  missions: defaultMissions,
  activeMission: defaultMissions[0],
  setActiveMission: (mission) =>
    useMissionStore.setState({ activeMission: mission }),

  stats: {
    activeMissions:     7,
    aiReports:          156,
    aiReportsTrend:     '+23%',
    intelSources:       12,
    intelSourcesDelta:  4,
    timeSaved:          '6.4h',
  },
}));
