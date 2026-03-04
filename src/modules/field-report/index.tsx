// ============================================================
// Field Report — WP07
// Hoofd-module: 4-tab navigatie
//   Tab 1: Opname       — compact VoiceRecorder
//   Tab 2: Transcriptie — live transcript + bewerken
//   Tab 3: SALUTE       — AI parseert naar 6 SALUTE velden
//   Tab 4: MIST         — medisch rapport formulier + Claude
// ============================================================

import { useState }             from 'react';
import { useLanguage, t }       from '../../config/i18n';
import { Badge }                from '../../components/ui/Badge';
import { ClassificationBanner } from '../../components/shared/ClassificationBadge';
import { VoiceReport }          from './VoiceReport';
import { SaluteReport }         from './SaluteReport';
import { MistReport }           from './MistReport';
import clsx                     from 'clsx';

type TabId = 'record' | 'transcribe' | 'salute' | 'mist';

const TABS: {
  id: TabId;
  icon: string;
  labelKey: 'field.tab.record' | 'field.tab.transcribe' | 'field.tab.salute' | 'field.tab.aiParse';
}[] = [
  { id: 'record',     icon: '🎙️', labelKey: 'field.tab.record'     },
  { id: 'transcribe', icon: '📝', labelKey: 'field.tab.transcribe' },
  { id: 'salute',     icon: '📋', labelKey: 'field.tab.salute'     },
  { id: 'mist',       icon: '🏥', labelKey: 'field.tab.aiParse'    },
];

function TabBar({ activeTab, completedTabs, onSelect, lang }: {
  activeTab: TabId; completedTabs: Set<TabId>; onSelect: (id: TabId) => void; lang: 'nl' | 'en';
}) {
  return (
    <div className="flex border-b border-brand-border bg-brand-bg-card">
      {TABS.map((tab, idx) => {
        const isActive    = tab.id === activeTab;
        const isCompleted = completedTabs.has(tab.id);
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={clsx(
              'relative flex items-center gap-2 px-4 py-3 text-xs font-mono font-medium',
              'border-r border-brand-border last:border-r-0 transition-all flex-1 justify-center',
              isActive      ? 'text-brand-primary bg-brand-primary-dim'
              : isCompleted ? 'text-brand-text hover:text-brand-text-bright hover:bg-white/[0.03]'
                            : 'text-brand-text-dim hover:text-brand-text hover:bg-white/[0.02]',
            )}
          >
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />}
            <span className={clsx(
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
              isActive      ? 'bg-brand-primary text-brand-bg'
              : isCompleted ? 'bg-ado-green/20 text-ado-green border border-ado-green/30'
                            : 'bg-brand-bg-elevated text-brand-text-dim border border-brand-border',
            )}>
              {isCompleted && !isActive ? '✓' : idx + 1}
            </span>
            <span className="hidden sm:inline truncate">{t(tab.labelKey, lang)}</span>
            <span className="sm:hidden">{tab.icon}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function FieldReportModule() {
  const { lang }        = useLanguage();
  const [activeTab,     setActiveTab]     = useState<TabId>('record');
  const [completedTabs, setCompletedTabs] = useState<Set<TabId>>(new Set());
  const [transcript,    setTranscript]    = useState('');

  function complete(tab: TabId) {
    setCompletedTabs(prev => new Set([...prev, tab]));
  }

  function goTo(tab: TabId) { setActiveTab(tab); }

  function handleProcessToSalute(t: string) {
    setTranscript(t);
    complete('record');
    complete('transcribe');
    goTo('salute');
  }

  function handleTranscriptChange(t: string) {
    setTranscript(t);
  }

  function handleSaluteNext() {
    complete('salute');
    goTo('mist');
  }

  function handleNewReport() {
    setActiveTab('record');
    setCompletedTabs(new Set());
    setTranscript('');
  }

  return (
    <div className="animate-fade-in max-w-4xl space-y-0">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-brand-text-bright text-xl font-bold">
            🎙️ {lang === 'nl' ? 'Veldrapport' : 'Field Report'}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-brand-text-dim text-xs font-mono">
              {lang === 'nl'
                ? 'Spraak → SALUTE → MIST · Veldklaar'
                : 'Voice → SALUTE → MIST · Field ready'}
            </p>
            <span className="text-brand-text-dim/40 font-mono text-xs">·</span>
            <Badge variant="operational" size="xs" dot pulse>
              {lang === 'nl' ? 'Chrome/Edge vereist' : 'Chrome/Edge required'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-bg-card border border-brand-border rounded-full px-3 py-1.5">
          {TABS.map(tab => (
            <span key={tab.id} className={clsx(
              'w-2 h-2 rounded-full transition-all',
              completedTabs.has(tab.id) ? 'bg-ado-green'
              : activeTab === tab.id    ? 'bg-brand-primary'
                                        : 'bg-brand-border',
            )} />
          ))}
          <span className="text-[10px] font-mono text-brand-text-dim ml-1">
            {completedTabs.size}/4
          </span>
        </div>
      </div>

      {/* ── Module shell ── */}
      <div className="bg-brand-bg-card border border-brand-border rounded-xl overflow-hidden">
        <ClassificationBanner level="RESTRICTED" />

        <TabBar
          activeTab={activeTab}
          completedTabs={completedTabs}
          onSelect={goTo}
          lang={lang}
        />

        <div className="p-5">
          {(activeTab === 'record' || activeTab === 'transcribe') && (
            <VoiceReport
              transcript={transcript}
              onTranscriptChange={handleTranscriptChange}
              onProcessToSalute={handleProcessToSalute}
            />
          )}
          {activeTab === 'salute' && (
            <SaluteReport
              transcript={transcript}
              onNext={handleSaluteNext}
            />
          )}
          {activeTab === 'mist' && (
            <MistReport
              transcript={transcript}
              onNewReport={handleNewReport}
            />
          )}
        </div>
      </div>
    </div>
  );
}
