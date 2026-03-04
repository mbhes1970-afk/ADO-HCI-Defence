// ============================================================
// ScenarioEngine — WP08 sub-component
// AI-gedreven scenario met beslismomenten + respons-scoring
// State machine: intro → decision_1 → ... → decision_N → complete
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useLanguage }           from '../../config/i18n';
import { useAI }                 from '../../hooks/useAI';
import { Badge }                 from '../../components/ui/Badge';
import { Button }                from '../../components/ui/Button';
import { Panel }                 from '../../components/ui/Card';
import { ProgressBar }           from '../../components/ui/ProgressBar';
import type { TrainingScenario } from '../../config/types';
import clsx                      from 'clsx';

// ── Scenario system prompts ──────────────────────────────────
const SCENARIO_SYSTEMS: Record<string, { nl: string; en: string }> = {
  'fp-breach': {
    nl: `Je bent een militaire trainingsAI voor een Force Protection Breach scenario.
Je stuurt de trainee door een perimeter-inbreuk situatie met 3 beslismomenten.
Bij elk beslismoment presenteer je: 1) De situatie (2-3 zinnen), 2) Precies 3 genummerde keuzes.
Reageer ALLEEN in JSON:
{"situation":"...","choices":["1. ...", "2. ...", "3. ..."],"phase":"decision","decisionNumber":N}
Na een keuze geef je feedback op die keuze en ga je door naar het volgende beslismoment.
Als alle 3 beslismomenten voorbij zijn, geef je een eindscore in JSON:
{"feedback":"...","score":85,"phase":"complete","summary":"..."}`,
    en: `You are a military training AI for a Force Protection Breach scenario.
Guide the trainee through a perimeter breach with 3 decision points.
At each decision point present: 1) The situation (2-3 sentences), 2) Exactly 3 numbered choices.
Respond ONLY in JSON:
{"situation":"...","choices":["1. ...", "2. ...", "3. ..."],"phase":"decision","decisionNumber":N}
After a choice give feedback on that choice then move to the next decision point.
After all 3 decisions give a final score in JSON:
{"feedback":"...","score":85,"phase":"complete","summary":"..."}`,
  },
  'intel-pressure': {
    nl: `Je bent een militaire trainingsAI voor een Intel Analyse Onder Druk scenario.
Tijdslimiet is 15 minuten. Tegenstrijdige rapporten. 4 beslismomenten.
Reageer ALLEEN in JSON: {"situation":"...","choices":["1. ...","2. ...","3. ..."],"phase":"decision","decisionNumber":N}
Na alle beslissingen: {"feedback":"...","score":78,"phase":"complete","summary":"..."}`,
    en: `You are a military training AI for an Intel Analysis Under Pressure scenario.
Time limit is 15 minutes. Conflicting reports. 4 decision points.
Respond ONLY in JSON: {"situation":"...","choices":["1. ...","2. ...","3. ..."],"phase":"decision","decisionNumber":N}
After all decisions: {"feedback":"...","score":78,"phase":"complete","summary":"..."}`,
  },
  'mass-casualty': {
    nl: `Je bent een militaire trainingsAI voor een Massa Slachtoffer Respons scenario.
IED-detonatie. 5 triage-beslismomenten. MEDEVAC coördinatie onder druk.
Reageer ALLEEN in JSON: {"situation":"...","choices":["1. ...","2. ...","3. ..."],"phase":"decision","decisionNumber":N}
Na alle beslissingen: {"feedback":"...","score":71,"phase":"complete","summary":"..."}`,
    en: `You are a military training AI for a Mass Casualty Response scenario.
IED detonation. 5 triage decision points. MEDEVAC coordination under pressure.
Respond ONLY in JSON: {"situation":"...","choices":["1. ...","2. ...","3. ..."],"phase":"decision","decisionNumber":N}
After all decisions: {"feedback":"...","score":71,"phase":"complete","summary":"..."}`,
  },
};

// ── Types ────────────────────────────────────────────────────
interface ScenarioState {
  phase:          'intro' | 'decision' | 'feedback' | 'complete';
  decisionNumber: number;
  situation:      string;
  choices:        string[];
  lastChoice:     string;
  feedback:       string;
  score:          number;
  summary:        string;
  history:        { decision: number; choice: string; feedback: string; score?: number }[];
}

const INITIAL_STATE: ScenarioState = {
  phase: 'intro', decisionNumber: 0,
  situation: '', choices: [], lastChoice: '',
  feedback: '', score: 0, summary: '', history: [],
};

interface ScenarioEngineProps {
  scenario:  TrainingScenario;
  onComplete: (score: number, summary: string) => void;
  onAbort:    () => void;
}

export function ScenarioEngine({ scenario, onComplete, onAbort }: ScenarioEngineProps) {
  const { lang }            = useLanguage();
  const { loading, call }   = useAI();
  const [state, setState]   = useState<ScenarioState>(INITIAL_STATE);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // ── Timer ──
  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  // ── Start scenario ──
  const startScenario = useCallback(async () => {
    setTimerActive(true);
    const systemPair = SCENARIO_SYSTEMS[scenario.id];
    const system = systemPair ? systemPair[lang] : SCENARIO_SYSTEMS['fp-breach'][lang];

    const raw = await call({
      system,
      messages: [{
        role: 'user',
        content: lang === 'nl'
          ? 'Start het scenario. Geef het eerste beslismoment.'
          : 'Start the scenario. Present the first decision point.',
      }],
      maxTokens: 600,
      temperature: 0.7,
    });

    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setState(prev => ({
        ...prev,
        phase: 'decision',
        decisionNumber: parsed.decisionNumber ?? 1,
        situation: parsed.situation ?? '',
        choices: parsed.choices ?? [],
      }));
    } catch {
      setState(prev => ({ ...prev, phase: 'decision', situation: raw, choices: [] }));
    }
  }, [scenario.id, lang, call]);

  // ── Submit choice ──
  async function submitChoice(choice: string) {
    setState(prev => ({ ...prev, phase: 'feedback', lastChoice: choice }));

    const systemPair = SCENARIO_SYSTEMS[scenario.id];
    const system = systemPair ? systemPair[lang] : SCENARIO_SYSTEMS['fp-breach'][lang];

    const history = state.history.map(h =>
      `Beslismoment ${h.decision}: ${h.choice}`
    ).join('\n');

    const raw = await call({
      system,
      messages: [
        { role: 'user',      content: lang === 'nl' ? 'Start het scenario. Geef het eerste beslismoment.' : 'Start the scenario. Present the first decision point.' },
        { role: 'assistant', content: JSON.stringify({ situation: state.situation, choices: state.choices, phase: 'decision', decisionNumber: state.decisionNumber }) },
        ...(history ? [{ role: 'user' as const, content: `Eerdere keuzes:\n${history}` }] : []),
        { role: 'user',      content: `${lang === 'nl' ? 'Mijn keuze:' : 'My choice:'} ${choice}` },
      ],
      maxTokens: 700,
      temperature: 0.6,
    });

    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

      if (parsed.phase === 'complete') {
        setTimerActive(false);
        setState(prev => ({
          ...prev,
          phase: 'complete',
          feedback: parsed.feedback ?? '',
          score: parsed.score ?? 75,
          summary: parsed.summary ?? '',
          history: [...prev.history, { decision: prev.decisionNumber, choice, feedback: parsed.feedback ?? '', score: parsed.score }],
        }));
        onComplete(parsed.score ?? 75, parsed.summary ?? '');
      } else {
        setState(prev => ({
          ...prev,
          phase: 'decision',
          decisionNumber: parsed.decisionNumber ?? prev.decisionNumber + 1,
          situation: parsed.situation ?? '',
          choices: parsed.choices ?? [],
          feedback: parsed.feedback ?? '',
          history: [...prev.history, { decision: prev.decisionNumber, choice, feedback: parsed.feedback ?? '' }],
        }));
      }
    } catch {
      setState(prev => ({
        ...prev,
        phase: 'decision',
        feedback: raw,
        decisionNumber: prev.decisionNumber + 1,
        history: [...prev.history, { decision: prev.decisionNumber, choice, feedback: raw }],
      }));
    }
  }

  const progress = (state.decisionNumber / scenario.decisionPoints) * 100;

  // ── Render: INTRO ──
  if (state.phase === 'intro') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-3">
          <span className="text-5xl block">{scenario.icon}</span>
          <h2 className="text-brand-text-bright text-xl font-bold">{scenario.title[lang]}</h2>
          <p className="text-brand-text-dim text-sm font-mono leading-relaxed">
            {scenario.description[lang]}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '⏱️', label: lang === 'nl' ? 'Duur' : 'Duration',  value: `${scenario.durationMinutes} min` },
            { icon: '🎯', label: lang === 'nl' ? 'Beslismomenten' : 'Decision pts', value: scenario.decisionPoints },
            { icon: '🤖', label: lang === 'nl' ? 'AI Feedback' : 'AI Feedback', value: lang === 'nl' ? 'Live' : 'Live' },
          ].map(({ icon, label, value }) => (
            <Panel key={label} className="py-3">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-brand-text-bright font-bold font-mono text-base">{value}</p>
              <p className="text-brand-text-dim text-[10px] font-mono">{label}</p>
            </Panel>
          ))}
        </div>

        <div className="bg-ado-amber/10 border border-ado-amber/25 rounded-lg px-4 py-3">
          <p className="text-ado-amber text-xs font-mono">
            ⚠️ {lang === 'nl'
              ? 'Beslissingen worden beoordeeld op snelheid, nauwkeurigheid en NATO-doctrine.'
              : 'Decisions are assessed on speed, accuracy, and NATO doctrine compliance.'}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={onAbort} className="flex-shrink-0">
            {lang === 'nl' ? '← Terug' : '← Back'}
          </Button>
          <Button variant="primary" size="md" fullWidth loading={loading} onClick={startScenario} iconLeft="▶">
            {lang === 'nl' ? 'Start Scenario' : 'Start Scenario'}
          </Button>
        </div>
      </div>
    );
  }

  // ── Render: DECISION / FEEDBACK ──
  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* ── Progress header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{scenario.icon}</span>
          <div>
            <p className="text-brand-text-bright text-xs font-semibold">{scenario.title[lang]}</p>
            <p className="text-brand-text-dim text-[10px] font-mono">
              {lang === 'nl' ? `Beslismoment ${state.decisionNumber}/${scenario.decisionPoints}` : `Decision ${state.decisionNumber}/${scenario.decisionPoints}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-brand-text-bright tabular-nums">{formatTime(elapsed)}</span>
          <Badge variant="live" size="xs" dot pulse>LIVE</Badge>
          <button onClick={onAbort} className="text-[10px] font-mono text-brand-text-dim hover:text-ado-red transition-colors">
            ✕ {lang === 'nl' ? 'Afbreken' : 'Abort'}
          </button>
        </div>
      </div>

      <ProgressBar value={progress} color="primary" size="xs" />

      {/* ── Previous feedback strip ── */}
      {state.feedback && state.phase === 'decision' && (
        <div className="bg-ado-blue/5 border border-ado-blue/20 rounded-lg px-4 py-3 animate-fade-in">
          <p className="text-[9px] font-mono text-ado-blue uppercase tracking-wider mb-1">
            🤖 {lang === 'nl' ? 'AI Feedback op vorige keuze' : 'AI Feedback on previous choice'}
          </p>
          <p className="text-brand-text text-xs font-mono leading-relaxed">{state.feedback}</p>
        </div>
      )}

      {/* ── Situation ── */}
      {loading ? (
        <Panel className="min-h-[120px] flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-brand-text-dim text-xs font-mono">
            {lang === 'nl' ? 'AI verwerkt uw beslissing...' : 'AI processing your decision...'}
          </p>
        </Panel>
      ) : (
        <Panel className="space-y-4">
          <div className="flex items-start gap-2">
            <span className="text-[10px] font-mono text-ado-red uppercase tracking-widest flex-shrink-0 mt-0.5">
              ⚡ {lang === 'nl' ? 'SITUATIE' : 'SITUATION'}
            </span>
          </div>
          <p className="text-brand-text-bright text-sm font-mono leading-relaxed whitespace-pre-wrap">
            {state.situation}
          </p>
        </Panel>
      )}

      {/* ── Choices ── */}
      {!loading && state.choices.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest">
            {lang === 'nl' ? 'Jouw beslissing:' : 'Your decision:'}
          </p>
          {state.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => submitChoice(choice)}
              disabled={loading || state.phase === 'feedback'}
              className={clsx(
                'w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 font-mono text-xs',
                'border-brand-border bg-brand-bg-elevated text-brand-text',
                'hover:border-brand-primary/40 hover:bg-brand-primary-dim hover:text-brand-text-bright',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary/60',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                state.lastChoice === choice && state.phase === 'feedback'
                  ? 'border-brand-primary/50 bg-brand-primary-dim text-brand-primary'
                  : '',
              )}
            >
              {choice}
            </button>
          ))}
        </div>
      )}

      {/* ── Decision history ── */}
      {state.history.length > 0 && (
        <details className="group">
          <summary className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider cursor-pointer hover:text-brand-text-bright transition-colors">
            {lang === 'nl' ? '▸ Beslissingshistorie' : '▸ Decision history'} ({state.history.length})
          </summary>
          <div className="mt-2 space-y-2">
            {state.history.map((h, i) => (
              <div key={i} className="bg-brand-bg-elevated border border-brand-border rounded px-3 py-2">
                <p className="text-[10px] font-mono text-brand-primary mb-1">
                  {lang === 'nl' ? `Beslismoment ${h.decision}` : `Decision ${h.decision}`}
                </p>
                <p className="text-xs font-mono text-brand-text-bright">{h.choice}</p>
                {h.feedback && (
                  <p className="text-[10px] font-mono text-brand-text-dim mt-1 line-clamp-2">{h.feedback}</p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
