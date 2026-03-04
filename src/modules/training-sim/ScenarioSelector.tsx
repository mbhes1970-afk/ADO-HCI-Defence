// ============================================================
// ScenarioSelector — WP08 sub-component
// 3 scenario kaarten met details + start-knop
// ============================================================

import { useLanguage }        from '../../config/i18n';
import { useTrainingStore }   from '../../store/trainingStore';
import { Badge }              from '../../components/ui/Badge';
import { Button }             from '../../components/ui/Button';
import { RingProgress }       from '../../components/ui/ProgressBar';
import type { TrainingScenario } from '../../config/types';
import clsx                   from 'clsx';

const difficultyMeta: Record<string, { nl: string; en: string; color: string; badge: 'operational' | 'pending' | 'critical' }> = {
  'fp-breach':     { nl: 'Gevorderd',    en: 'Advanced',     color: 'text-ado-amber', badge: 'pending'   },
  'intel-pressure':{ nl: 'Expert',       en: 'Expert',       color: 'text-ado-red',   badge: 'critical'  },
  'mass-casualty': { nl: 'Gevorderd',    en: 'Advanced',     color: 'text-ado-amber', badge: 'pending'   },
};

const scenarioTheme: Record<string, { accent: string; glow: string }> = {
  'fp-breach':      { accent: 'border-ado-amber/30', glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]' },
  'intel-pressure': { accent: 'border-ado-blue/30',  glow: 'hover:shadow-[0_0_30px_rgba(96,165,250,0.08)]' },
  'mass-casualty':  { accent: 'border-ado-red/30',   glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.08)]'  },
};

const scenarioHighScore: Record<string, number> = {
  'fp-breach': 84, 'intel-pressure': 0, 'mass-casualty': 71,
};

interface ScenarioCardProps {
  scenario:   TrainingScenario;
  lang:       'nl' | 'en';
  onSelect:   (s: TrainingScenario) => void;
}

function ScenarioCard({ scenario, lang, onSelect }: ScenarioCardProps) {
  const diff      = difficultyMeta[scenario.id];
  const theme     = scenarioTheme[scenario.id];
  const highScore = scenarioHighScore[scenario.id];

  return (
    <div className={clsx(
      'bg-brand-bg-card border rounded-xl p-5 flex flex-col gap-4',
      'transition-all duration-300 cursor-pointer group relative overflow-hidden',
      theme.accent,
      theme.glow,
      'hover:-translate-y-1',
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(200,165,90,0.03) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{scenario.icon}</span>
          <div>
            <h3 className="text-brand-text-bright font-semibold text-sm leading-tight">
              {scenario.title[lang]}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={diff.badge} size="xs">{diff[lang]}</Badge>
              {highScore > 0 && (
                <span className="text-[10px] font-mono text-brand-text-dim">
                  PB: {highScore}%
                </span>
              )}
            </div>
          </div>
        </div>
        {highScore > 0 && (
          <RingProgress value={highScore} size={40} stroke={3} color="primary" />
        )}
      </div>

      {/* Description */}
      <p className="text-brand-text-dim text-xs font-mono leading-relaxed flex-1">
        {scenario.description[lang]}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-4 py-2 border-t border-brand-border">
        {[
          { icon: '⏱️', value: `${scenario.durationMinutes} min` },
          { icon: '🎯', value: `${scenario.decisionPoints} ${lang === 'nl' ? 'beslismomenten' : 'decision points'}` },
          { icon: '🤖', value: 'AI Feedback' },
        ].map(({ icon, value }) => (
          <div key={value} className="flex items-center gap-1.5">
            <span className="text-xs opacity-60">{icon}</span>
            <span className="text-[10px] font-mono text-brand-text-dim">{value}</span>
          </div>
        ))}
      </div>

      {/* Start button */}
      <Button
        variant="primary"
        size="sm"
        fullWidth
        onClick={() => onSelect(scenario)}
        className="relative z-10"
      >
        {highScore > 0
          ? (lang === 'nl' ? '🔄 Opnieuw Spelen' : '🔄 Play Again')
          : (lang === 'nl' ? '▶ Start Scenario' : '▶ Start Scenario')}
      </Button>
    </div>
  );
}

interface ScenarioSelectorProps {
  onSelect: (scenario: TrainingScenario) => void;
}

export function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  const { lang }                      = useLanguage();
  const { scenarios, competencies, completedCount, completedDelta } = useTrainingStore();

  return (
    <div className="space-y-6">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '🎮', value: completedCount, label: { nl: 'Afgerond', en: 'Completed' }, delta: `+${completedDelta}` },
          { icon: '🏆', value: '84%', label: { nl: 'Beste Score', en: 'Best Score' }, delta: '↑ 12%' },
          { icon: '⏱️', value: '4.2h', label: { nl: 'Trainingstijd', en: 'Training Time' }, delta: lang === 'nl' ? 'Totaal' : 'Total' },
        ].map(({ icon, value, label, delta }) => (
          <div key={label.nl} className="bg-brand-bg-card border border-brand-border rounded-lg p-3 text-center">
            <span className="text-xl">{icon}</span>
            <p className="text-brand-text-bright font-bold font-mono text-lg mt-1">{value}</p>
            <p className="text-brand-text-dim text-[10px] font-mono">{label[lang]}</p>
            <p className="text-ado-green text-[10px] font-mono font-semibold">{delta}</p>
          </div>
        ))}
      </div>

      {/* ── Scenario cards ── */}
      <div>
        <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest mb-3">
          {lang === 'nl' ? 'Beschikbare scenario\'s' : 'Available scenarios'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map(scenario => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              lang={lang}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      {/* ── Competency tracker preview ── */}
      <div className="bg-brand-bg-card border border-brand-border rounded-lg p-4">
        <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest mb-3">
          {lang === 'nl' ? 'Competentietracker' : 'Competency Tracker'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {competencies.map(comp => (
            <div key={comp.id} className="flex items-center gap-3">
              <RingProgress
                value={comp.score}
                size={44}
                stroke={3}
                color={comp.score >= 90 ? 'green' : comp.score >= 75 ? 'blue' : 'amber'}
              />
              <div>
                <p className="text-brand-text-bright text-xs font-semibold">{comp.label[lang]}</p>
                <p className={clsx(
                  'text-[10px] font-mono font-semibold mt-0.5',
                  comp.trend === 'up'   ? 'text-ado-green' :
                  comp.trend === 'down' ? 'text-ado-red'   : 'text-brand-text-dim',
                )}>
                  {comp.trend === 'up' ? '↑' : comp.trend === 'down' ? '↓' : '→'} {comp.delta}%
                  <span className="text-brand-text-dim font-normal ml-1">
                    {lang === 'nl' ? 'deze maand' : 'this month'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
