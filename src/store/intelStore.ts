// ============================================================
// intelStore — ADO
// Intelligence source data & correlation state
// ============================================================

import { create } from 'zustand';
import type { IntelSource } from '../config/types';

const defaultSources: IntelSource[] = [
  {
    id: 'sigint-001',
    type: 'SIGINT',
    label: { nl: 'SIGINT', en: 'SIGINT' },
    subLabel: 'Sector B-7',
    reliabilityCode: 'A2',
    summary: {
      nl: 'Elektronische emissies gedetecteerd op peiling 045°. Patroon suggereert gecoördineerde bewaking.',
      en: 'Electronic emissions detected at bearing 045°. Pattern suggests coordinated surveillance.',
    },
    updatedAt: '12 min',
    icon: '📡',
  },
  {
    id: 'imint-001',
    type: 'IMINT',
    label: { nl: 'IMINT', en: 'IMINT' },
    subLabel: 'Satellite Pass',
    reliabilityCode: 'B1',
    summary: {
      nl: 'Satellietbeelden tonen voertuigsporen consistent met licht gepantserde verkenning op sector B-7 aanvoerroutes.',
      en: 'Satellite imagery shows vehicle tracks consistent with light armored recon in sector B-7 approach routes.',
    },
    updatedAt: '2h',
    icon: '🛰️',
  },
  {
    id: 'humint-001',
    type: 'HUMINT',
    label: { nl: 'HUMINT', en: 'HUMINT' },
    subLabel: 'Report #47',
    reliabilityCode: 'C3',
    summary: {
      nl: 'Bron meldt ongebruikelijke voertuigbewegingen nabij sector B-7. Onbevestigd — enkelvoudige bron.',
      en: 'Source reports unusual vehicle movements near sector B-7. Unverified — single source, partial reliability.',
    },
    updatedAt: '6h',
    icon: '👁️',
  },
  {
    id: 'uav-001',
    type: 'UAV',
    label: { nl: 'UAV Tracker', en: 'UAV Tracker' },
    subLabel: 'Counter-UAS',
    reliabilityCode: 'A1',
    summary: {
      nl: '3 UAV-inbreuken in 48u. Type-X commerciële drone. Dageraad/schemering patroon bevestigd door sensordata.',
      en: '3 UAV incursions in 48h. Type-X commercial drone. Dawn/dusk pattern confirmed by sensor data.',
    },
    updatedAt: 'Live',
    isLive: true,
    icon: '🛩️',
  },
  {
    id: 'osint-001',
    type: 'OSINT',
    label: { nl: 'OSINT', en: 'OSINT' },
    subLabel: 'Media Mon.',
    reliabilityCode: 'D4',
    summary: {
      nl: 'Social media meldingen van drone-waarnemingen in nabijgelegen burgergbieden. Mogelijk verband met militaire UAV-activiteit.',
      en: 'Social media reports of drone sightings in nearby civilian areas. Possible link to military UAV activity.',
    },
    updatedAt: '30 min',
    icon: '📻',
  },
  {
    id: 'geoint-001',
    type: 'GEOINT',
    label: { nl: 'GEOINT', en: 'GEOINT' },
    subLabel: 'Terrain',
    reliabilityCode: 'A2',
    summary: {
      nl: 'Terreinanalyse: sector B-7 heeft beperkte natuurlijke dekking. Belangrijkste aanvoerroutes via MSR-kruisingen.',
      en: 'Terrain analysis: sector B-7 has limited natural cover. Key approach routes identified via MSR intersections.',
    },
    updatedAt: '24h',
    icon: '🗺️',
  },
];

interface IntelState {
  sources: IntelSource[];
  selectedSourceId: string | null;
  selectSource: (id: string | null) => void;
  correlationResult: string;
  setCorrelationResult: (result: string) => void;
  intsum: string;
  setIntsum: (intsum: string) => void;
}

export const useIntelStore = create<IntelState>((set) => ({
  sources: defaultSources,
  selectedSourceId: null,
  selectSource: (id) => set({ selectedSourceId: id }),
  correlationResult: '',
  setCorrelationResult: (result) => set({ correlationResult: result }),
  intsum: '',
  setIntsum: (intsum) => set({ intsum }),
}));
