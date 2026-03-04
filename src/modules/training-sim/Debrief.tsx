// ============================================================
// Debrief — WP08 sub-component
// Score ring, per-beslissing breakdown, competentie-update,
// AI narratief debrief + opties om opnieuw te spelen
// ============================================================

import { useState, useEffect }   from 'react';
import { useLanguage }           from '../../config/i18n';
import { useTrainingStore }      from '../../store/trainingStore';
import { useAI }                 from '../../hooks/useAI';
import { Badge }                 from '../../components/ui/Badge';
import { Button }                from '../../components/ui/Button';
import { Card, Panel }           from '../../components/ui/Card';
import { RingProgress, ProgressBar } from '../../components/ui/ProgressBar';
import type { TrainingScenario } from '../../config/types';
import clsx                      from 'clsx';

const SYSTEM_DEBRIEF = `You are a NATO military training instructor. Generate a structured debrief report.
Cover: 1) Overall performance assessment, 2) Key strengths shown, 3) Areas needing improvement, 
4) Doctrine compliance, 5) Specific recommendation for next training focus.
Be direct, professional, constructive. Use military terminology.
Respond in the same language as the user message.`;

interface DebriefProps {
  scenario:    TrainingScenario;
  score:       number;
  summary:     string;
  onPlayAgain: () => void;
  onNewScenario: () => void;
}

export function Debrief({ scenario, score, summary, onPlayAgain, onNewScenario }: DebriefProps) {
  const { lang }               = useLanguage();
  const { competencies }       = useTrainingStore();
  const { loading, call, response: debriefText } = useAI();
  const [generated, setGenerated] = useState(false);

  // Auto-generate debrief on mount
  useEffect(() => {
    generateDebrief();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateDebrief() {
    const prompt = lang === 'nl'
      ? `Genereer een debrief voor ${scenario.title.nl}. Score: ${score}/100.\n\nSamenvatting:\n${summary}`
      : `Generate a debrief for ${scenario.title.en}. Score: ${score}/100.\n\nSummary:\n${summary}`;

    await call({
      system:      SYSTEM_DEBRIEF,
      messages:    [{ role: 'user', content: prompt }],
      maxTokens:   700,
      temperature: 0.4,
    });
    setGenerated(true);
  }

  // Grade
  const grade = score >= 90 ? { letter: 'A', nl: 'Uitstekend',  en: 'Excellent',   color: 'text-ado-green',   ring: 'green'   as const }
              : score >= 80 ? { letter: 'B', nl: 'Goed',        en: 'Good',        color: 'text-ado-blue',    ring: 'blue'    as const }
              : score >= 70 ? { letter: 'C', nl: 'Voldoende',   en: 'Satisfactory',color: 'text-brand-primary',ring: 'primary' as const }
              :               { letter: 'D', nl: 'Verbetering', en: 'Needs Work',  color: 'text-ado-amber',   ring: 'amber'   as const };

  // Simulated per-decision scores (derived from overall)
  const decisionScores = Array.from({ length: scenario.decisionPoints }, (_, i) => {
    const base = score + (i % 2 === 0 ? 5 : -8) + (i * 3);
    return Math.min(100, Math.max(40, base));
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* ── Score hero ── */}
      <Card className="text-center py-6">
        <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest mb-4">
          {lang === 'nl' ? 'Eindscore' : 'Final Score'} · {scenario.title[lang]}
        </p>
        <div className="flex items-center justify-center gap-8">
          {/* Big ring */}
          <div className="relative">
            <RingProgress
              value={score}
              size={96}
              stroke={6}
              color={grade.ring}
              label={`${score}%`}
            />
          </div>
          {/* Grade + label */}
          <div className="text-left">
            <p className={clsx('text-5xl font-bold font-mono', grade.color)}>{grade.letter}</p>
            <p className={clsx('text-sm font-mono font-semibold mt-0.5', grade.color)}>
              {grade[lang]}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={score >= 80 ? 'operational' : score >= 70 ? 'pending' : 'critical'} size="sm" dot>
                {score >= 80 ? (lang === 'nl' ? 'GESLAAGD' : 'PASSED') : (lang === 'nl' ? 'HERHALING' : 'RETRY')}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Decision breakdown ── */}
      <Panel>
        <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest mb-3">
          {lang === 'nl' ? 'Per beslismoment' : 'Per decision point'}
        </p>
        <div className="space-y-2.5">
          {decisionScores.map((ds, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded bg-brand-bg-elevated border border-brand-border flex items-center justify-center text-[10px] font-mono font-bold text-brand-primary flex-shrink-0">
                {i + 1}
              </span>
              <ProgressBar
                value={ds}
                color={ds >= 80 ? 'green' : ds >= 65 ? 'blue' : 'amber'}
                size="sm"
                className="flex-1"
              />
              <span className="text-xs font-mono text-brand-text-bright w-8 text-right flex-shrink-0">
                {ds}%
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* ── Competency impact ── */}
      <Panel>
        <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest mb-3">
          {lang === 'nl' ? 'Competentie-impact' : 'Competency impact'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {competencies.map((comp, i) => {
            // Simulate competency delta from this run
            const delta = i === 0 ? (score >= 80 ? +3 : -2)
                        : i === 1 ? (score >= 75 ? +2 : 0)
                        : (score >= 85 ? +4 : -1);
            return (
              <div key={comp.id} className="bg-brand-bg-elevated border border-brand-border rounded-lg p-3">
                <p className="text-[10px] font-mono text-brand-text-dim mb-1">{comp.label[lang]}</p>
                <div className="flex items-center justify-between">
                  <span className="text-brand-text-bright font-mono font-bold text-sm">{comp.score}%</span>
                  <span className={clsx(
                    'text-[10px] font-mono font-semibold',
                    delta > 0 ? 'text-ado-green' : delta < 0 ? 'text-ado-red' : 'text-brand-text-dim',
                  )}>
                    {delta > 0 ? `↑ +${delta}%` : delta < 0 ? `↓ ${delta}%` : '→ 0%'}
                  </span>
                </div>
                <ProgressBar
                  value={comp.score}
                  color={comp.score >= 90 ? 'green' : comp.score >= 75 ? 'blue' : 'amber'}
                  size="xs"
                  className="mt-2"
                />
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ── AI Debrief narrative ── */}
      <Card padding="none">
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-brand-bg-elevated">
          <div className="flex items-center gap-2">
            <span className="text-sm">🤖</span>
            <span className="text-xs font-semibold text-brand-text-bright">
              {lang === 'nl' ? 'AI Instructeur — Debrief' : 'AI Instructor — Debrief'}
            </span>
            {generated && <Badge variant="ai" size="xs" dot>AI Generated</Badge>}
          </div>
          <Button variant="ghost" size="sm" loading={loading} onClick={generateDebrief} iconLeft="🔄">
            {lang === 'nl' ? 'Hergeneer' : 'Regenerate'}
          </Button>
        </div>
        <div className="p-4 min-h-[120px]">
          {loading && (
            <div className="flex items-center gap-2 py-4">
              <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-brand-text-dim">
                {lang === 'nl' ? 'AI instructeur analyseert prestaties...' : 'AI instructor analysing performance...'}
              </p>
            </div>
          )}
          {debriefText && !loading && (
            <p className="text-brand-text text-xs font-mono leading-relaxed whitespace-pre-wrap">
              {debriefText}
            </p>
          )}
        </div>
      </Card>

      {/* ── Actions ── */}
      <div className="flex gap-3 flex-wrap">
        <Button variant="secondary" size="sm" iconLeft="📤">
          {lang === 'nl' ? 'Export Rapport' : 'Export Report'}
        </Button>
        <Button variant="ghost" size="sm" iconLeft="🔄" onClick={onPlayAgain} className="flex-1 sm:flex-none">
          {lang === 'nl' ? 'Opnieuw Spelen' : 'Play Again'}
        </Button>
        <Button variant="primary" size="sm" iconLeft="▶" onClick={onNewScenario} className="flex-1 sm:flex-none">
          {lang === 'nl' ? 'Nieuw Scenario →' : 'New Scenario →'}
        </Button>
      </div>
    </div>
  );
}
