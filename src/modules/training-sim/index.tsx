// ============================================================
// Training Sim — WP08
// Hoofd-module: scenario selector → AI engine → debrief
// State machine: select → intro → playing → complete
// ============================================================

import { useState }            from 'react';
import { useLanguage }         from '../../config/i18n';
import { useTrainingStore }    from '../../store/trainingStore';
import { Badge }               from '../../components/ui/Badge';
import { ProgressBar }         from '../../components/ui/ProgressBar';
import { ScenarioSelector }    from './ScenarioSelector';
import { ScenarioEngine }      from './ScenarioEngine';
import { Debrief }             from './Debrief';
import type { TrainingScenario } from '../../config/types';
import clsx                    from 'clsx';

type Phase = 'select' | 'playing' | 'complete';

export default function TrainingSimModule() {
  const { lang }                    = useLanguage();
  const { setActiveScenario }       = useTrainingStore();
  const [phase,    setPhase]        = useState<Phase>('select');
  const [scenario, setScenario]     = useState<TrainingScenario | null>(null);
  const [score,    setScore]        = useState(0);
  const [summary,  setSummary]      = useState('');

  function handleSelectScenario(s: TrainingScenario) {
    setScenario(s);
    setActiveScenario(s);
    setPhase('playing');
  }

  function handleComplete(finalScore: number, finalSummary: string) {
    setScore(finalScore);
    setSummary(finalSummary);
    setPhase('complete');
  }

  function handleAbort() {
    setScenario(null);
    setActiveScenario(null);
    setPhase('select');
  }

  function handlePlayAgain() {
    if (scenario) {
      setPhase('playing');
    }
  }

  function handleNewScenario() {
    setScenario(null);
    setActiveScenario(null);
    setPhase('select');
  }

  // Phase label
  const phaseLabel = {
    select:   { nl: 'Scenario Selectie', en: 'Scenario Selection' },
    playing:  { nl: 'Scenario Actief',   en: 'Scenario Active'    },
    complete: { nl: 'Debrief',           en: 'Debrief'            },
  };

  return (
    <div className="animate-fade-in max-w-4xl space-y-0">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-brand-text-bright text-xl font-bold">
            🎮 {lang === 'nl' ? 'Training Simulator' : 'Training Simulator'}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-brand-text-dim text-xs font-mono">
              {lang === 'nl'
                ? 'AI-gedreven militaire beslisscenario\'s · Live feedback'
                : 'AI-driven military decision scenarios · Live feedback'}
            </p>
            <span className="text-brand-text-dim/40 font-mono text-xs">·</span>
            <Badge
              variant={phase === 'playing' ? 'live' : phase === 'complete' ? 'complete' : 'neutral'}
              size="xs"
              dot={phase === 'playing'}
              pulse={phase === 'playing'}
            >
              {phaseLabel[phase][lang].toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Phase progress dots */}
        <div className="flex items-center gap-2 bg-brand-bg-card border border-brand-border rounded-full px-3 py-1.5">
          {(['select', 'playing', 'complete'] as Phase[]).map((p) => (
            <span key={p} className={clsx(
              'w-2 h-2 rounded-full transition-all',
              p === phase          ? 'bg-brand-primary' :
              (p === 'playing'  && phase === 'complete') ||
              (p === 'select'   && (phase === 'playing' || phase === 'complete'))
                ? 'bg-ado-green'  : 'bg-brand-border',
            )} />
          ))}
          {scenario && phase === 'playing' && (
            <span className="text-[10px] font-mono text-ado-red ml-1 font-semibold animate-pulse">LIVE</span>
          )}
        </div>
      </div>

      {/* ── Module shell ── */}
      <div className="bg-brand-bg-card border border-brand-border rounded-xl overflow-hidden">

        {/* Context bar — shown during play */}
        {scenario && phase === 'playing' && (
          <div className="flex items-center gap-3 px-4 py-2 bg-ado-red/5 border-b border-ado-red/20">
            <span className="text-lg">{scenario.icon}</span>
            <span className="text-xs font-mono text-ado-red font-semibold uppercase tracking-wide">
              {scenario.title[lang]}
            </span>
            <span className="text-[10px] font-mono text-brand-text-dim">
              · {scenario.durationMinutes} min · {scenario.decisionPoints} {lang === 'nl' ? 'beslismomenten' : 'decision pts'}
            </span>
            <div className="ml-auto">
              <ProgressBar value={33} color="red" size="xs" className="w-24" />
            </div>
          </div>
        )}

        <div className="p-5">
          {phase === 'select' && (
            <ScenarioSelector onSelect={handleSelectScenario} />
          )}

          {phase === 'playing' && scenario && (
            <ScenarioEngine
              scenario={scenario}
              onComplete={handleComplete}
              onAbort={handleAbort}
            />
          )}

          {phase === 'complete' && scenario && (
            <Debrief
              scenario={scenario}
              score={score}
              summary={summary}
              onPlayAgain={handlePlayAgain}
              onNewScenario={handleNewScenario}
            />
          )}
        </div>
      </div>
    </div>
  );
}
