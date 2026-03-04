// ============================================================
// Mission Brief — WP05
// Hoofd-module: 4-stap tab navigatie
//   Tab 1: PreBrief     — missie-info + AI situatiebeoordeling
//   Tab 2: LiveBriefing — spraakopname + transcript + AI keypunten
//   Tab 3: OpordBuilder — Claude genereert 5-para OPORD
//   Tab 4: PostBrief    — samenvatting + export + C2 opslaan
// ============================================================

import { useState }             from 'react';
import { useLanguage, t }       from '../../config/i18n';
import { useMissionStore }      from '../../store/missionStore';
import { StatusBadge }          from '../../components/ui/Badge';
import { ClassificationBanner } from '../../components/shared/ClassificationBadge';
import { PreBrief }             from './PreBrief';
import { LiveBriefing }         from './LiveBriefing';
import { OpordBuilder }         from './OpordBuilder';
import { PostBrief }            from './PostBrief';
import clsx                     from 'clsx';

// ── Tab definitions ──────────────────────────────────────────
type TabId = 'pre-brief' | 'live' | 'opord' | 'post-brief';

const TABS: { id: TabId; icon: string; labelKey: 'brief.tab.preBrief' | 'brief.tab.live' | 'brief.tab.opord' | 'brief.tab.postBrief' }[] = [
  { id: 'pre-brief',  icon: '📋', labelKey: 'brief.tab.preBrief'  },
  { id: 'live',       icon: '🎙️', labelKey: 'brief.tab.live'      },
  { id: 'opord',      icon: '📄', labelKey: 'brief.tab.opord'     },
  { id: 'post-brief', icon: '✅', labelKey: 'brief.tab.postBrief' },
];

// ── Tab bar ──────────────────────────────────────────────────
function TabBar({
  activeTab,
  completedTabs,
  onSelect,
  lang,
}: {
  activeTab:     TabId;
  completedTabs: Set<TabId>;
  onSelect:      (id: TabId) => void;
  lang:          'nl' | 'en';
}) {
  return (
    <div className="flex border-b border-brand-border bg-brand-bg-card">
      {TABS.map((tab, idx) => {
        const isActive    = tab.id === activeTab;
        const isCompleted = completedTabs.has(tab.id);
        const isLocked    = false; // all tabs freely navigable

        return (
          <button
            key={tab.id}
            onClick={() => !isLocked && onSelect(tab.id)}
            className={clsx(
              'relative flex items-center gap-2 px-4 py-3 text-xs font-mono font-medium',
              'border-r border-brand-border last:border-r-0 transition-all',
              'flex-1 justify-center',
              isActive
                ? 'text-brand-primary bg-brand-primary-dim'
                : isCompleted
                  ? 'text-brand-text hover:text-brand-text-bright hover:bg-white/[0.03]'
                  : 'text-brand-text-dim hover:text-brand-text hover:bg-white/[0.02]',
            )}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
            )}

            {/* Step number / complete check */}
            <span className={clsx(
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all',
              isActive    ? 'bg-brand-primary text-brand-bg'          :
              isCompleted ? 'bg-ado-green/20 text-ado-green border border-ado-green/30' :
                            'bg-brand-bg-elevated text-brand-text-dim border border-brand-border',
            )}>
              {isCompleted && !isActive ? '✓' : idx + 1}
            </span>

            <span className="hidden sm:inline truncate">
              {t(tab.labelKey, lang)}
            </span>
            <span className="sm:hidden">{tab.icon}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MISSION BRIEF MODULE
// ═══════════════════════════════════════════════════════════════
export default function MissionBriefModule() {
  const { lang }          = useLanguage();
  const { activeMission } = useMissionStore();

  const [activeTab,     setActiveTab]     = useState<TabId>('pre-brief');
  const [completedTabs, setCompletedTabs] = useState<Set<TabId>>(new Set());
  const [transcript,    setTranscript]    = useState('');

  function completeTab(tab: TabId) {
    setCompletedTabs((prev) => new Set([...prev, tab]));
  }

  function goToTab(tab: TabId) {
    setActiveTab(tab);
  }

  function handlePreBriefNext() {
    completeTab('pre-brief');
    goToTab('live');
  }

  function handleLiveBriefingNext(t: string) {
    setTranscript(t);
    completeTab('live');
    goToTab('opord');
  }

  function handleOpordNext() {
    completeTab('opord');
    goToTab('post-brief');
  }

  function handleNewBriefing() {
    setActiveTab('pre-brief');
    setCompletedTabs(new Set());
    setTranscript('');
  }

  return (
    <div className="animate-fade-in max-w-5xl space-y-0">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-brand-text-bright text-xl font-bold">
            📋 {lang === 'nl' ? 'Missie Briefing' : 'Mission Briefing'}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-brand-text-dim text-xs font-mono">
              {lang === 'nl'
                ? 'AI-ondersteunde briefing · Spraak naar OPORD'
                : 'AI-assisted briefing · Voice to OPORD'}
            </p>
            {activeMission && (
              <>
                <span className="text-brand-text-dim/40 font-mono text-xs">·</span>
                <span className="text-brand-primary text-xs font-mono font-semibold">
                  {activeMission.name[lang]}
                </span>
                <StatusBadge status={activeMission.status} size="xs" />
              </>
            )}
          </div>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-1.5 bg-brand-bg-card border border-brand-border rounded-full px-3 py-1.5">
          {TABS.map((tab) => (
            <span
              key={tab.id}
              className={clsx(
                'w-2 h-2 rounded-full transition-all',
                completedTabs.has(tab.id)  ? 'bg-ado-green' :
                activeTab === tab.id       ? 'bg-brand-primary' :
                                             'bg-brand-border',
              )}
            />
          ))}
          <span className="text-[10px] font-mono text-brand-text-dim ml-1">
            {completedTabs.size}/4
          </span>
        </div>
      </div>

      {/* ── Module shell ── */}
      <div className="bg-brand-bg-card border border-brand-border rounded-xl overflow-hidden">

        {/* Classification banner */}
        <ClassificationBanner level="RESTRICTED" />

        {/* Tab bar */}
        <TabBar
          activeTab={activeTab}
          completedTabs={completedTabs}
          onSelect={goToTab}
          lang={lang}
        />

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'pre-brief' && (
            <PreBrief onNext={handlePreBriefNext} />
          )}
          {activeTab === 'live' && (
            <LiveBriefing
              onNext={handleLiveBriefingNext}
              onTranscriptChange={setTranscript}
            />
          )}
          {activeTab === 'opord' && (
            <OpordBuilder
              transcript={transcript}
              onNext={handleOpordNext}
            />
          )}
          {activeTab === 'post-brief' && (
            <PostBrief
              transcript={transcript}
              onNewBriefing={handleNewBriefing}
            />
          )}
        </div>
      </div>
    </div>
  );
}
