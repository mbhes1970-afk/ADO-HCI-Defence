// ============================================================
// VoiceReport — WP07 sub-component
// Tab 1+2: Compact spraakopname + live transcript bewerking
// ============================================================

import { useState, useCallback }   from 'react';
import { useLanguage }             from '../../config/i18n';
import { VoiceRecorder }           from '../../components/shared/VoiceRecorder';
import { Button }                  from '../../components/ui/Button';
import { Panel }                   from '../../components/ui/Card';
import { Badge }                   from '../../components/ui/Badge';
import clsx                        from 'clsx';

// Tip snippets shown during recording
const RECORDING_TIPS = {
  nl: [
    'Spreek duidelijk: Grootte, Activiteit, Locatie...',
    'Noem eenheden met NATO-aanduiding',
    'Gebruik klokposities voor richting: "12 uur"',
    'Tijden in 24-uurs format: "veertien honderd"',
  ],
  en: [
    'Speak clearly: Size, Activity, Location...',
    'State units with NATO designation',
    'Use clock positions for direction: "12 o\'clock"',
    'Times in 24-hour format: "fourteen hundred"',
  ],
};

interface VoiceReportProps {
  transcript:             string;
  onTranscriptChange:     (t: string) => void;
  onProcessToSalute:      (t: string) => void;
}

export function VoiceReport({ transcript, onTranscriptChange, onProcessToSalute }: VoiceReportProps) {
  const { lang }         = useLanguage();
  const [tipIdx, setTipIdx] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState('');

  const handleTranscriptChange = useCallback((t: string) => {
    onTranscriptChange(t);
  }, [onTranscriptChange]);

  function handleStop(t: string) {
    onTranscriptChange(t);
    // Rotate tip
    setTipIdx(i => (i + 1) % RECORDING_TIPS[lang].length);
  }

  function startEdit() {
    setEditText(transcript);
    setEditMode(true);
  }

  function saveEdit() {
    onTranscriptChange(editText);
    setEditMode(false);
  }

  const tips = RECORDING_TIPS[lang];
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-brand-text-bright font-semibold text-sm">
            🎙️ {lang === 'nl' ? 'Veldrapport — Spraakopname' : 'Field Report — Voice Recording'}
          </h3>
          <p className="text-brand-text-dim text-[10px] font-mono mt-0.5">
            {lang === 'nl'
              ? 'Spreek uw observatie in · AI verwerkt naar SALUTE'
              : 'Speak your observation · AI processes to SALUTE'}
          </p>
        </div>
        {transcript && (
          <Badge variant="operational" size="xs" dot>
            {wordCount} {lang === 'nl' ? 'woorden' : 'words'}
          </Badge>
        )}
      </div>

      {/* ── Recorder (compact mode) ── */}
      <Panel>
        <VoiceRecorder
          compact
          onTranscriptChange={handleTranscriptChange}
          onStop={handleStop}
          label={{
            nl: 'Start Veldrapport',
            en: 'Start Field Report',
          }}
        />
      </Panel>

      {/* ── SALUTE tip banner ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-ado-blue/5 border border-ado-blue/20">
        <span className="text-ado-blue text-sm flex-shrink-0">💡</span>
        <p className="text-ado-blue text-[11px] font-mono">
          {tips[tipIdx]}
        </p>
        <button
          onClick={() => setTipIdx(i => (i + 1) % tips.length)}
          className="ml-auto text-ado-blue/50 hover:text-ado-blue text-xs font-mono transition-colors flex-shrink-0"
        >
          {lang === 'nl' ? 'Volgende tip →' : 'Next tip →'}
        </button>
      </div>

      {/* ── Transcript editor ── */}
      <div className="bg-brand-bg-card border border-brand-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-brand-border bg-brand-bg-elevated">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">
              📝 {lang === 'nl' ? 'Transcriptie' : 'Transcript'}
            </span>
            {transcript && <Badge variant="ai" size="xs">
              {lang === 'nl' ? 'Opgenomen' : 'Recorded'}
            </Badge>}
          </div>
          <div className="flex items-center gap-2">
            {transcript && !editMode && (
              <button
                onClick={startEdit}
                className="text-[10px] font-mono text-brand-text-dim hover:text-brand-primary transition-colors"
              >
                ✏️ {lang === 'nl' ? 'Bewerk' : 'Edit'}
              </button>
            )}
            {editMode && (
              <>
                <button onClick={() => setEditMode(false)} className="text-[10px] font-mono text-brand-text-dim hover:text-ado-red transition-colors">
                  {lang === 'nl' ? 'Annuleer' : 'Cancel'}
                </button>
                <button onClick={saveEdit} className="text-[10px] font-mono text-ado-green hover:text-ado-green/80 transition-colors">
                  ✓ {lang === 'nl' ? 'Opslaan' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-3 min-h-[100px]">
          {editMode ? (
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full bg-transparent text-brand-text text-xs font-mono leading-relaxed resize-none focus:outline-none min-h-[100px]"
              autoFocus
            />
          ) : transcript ? (
            <p className="text-brand-text text-xs font-mono leading-relaxed whitespace-pre-wrap">
              {transcript}
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 text-center">
              <p className="text-brand-text-dim text-[11px] font-mono italic">
                {lang === 'nl'
                  ? 'Transcriptie verschijnt hier tijdens opname...'
                  : 'Transcript appears here during recording...'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── SALUTE format reminder ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { letter: 'S', nl: 'Grootte',   en: 'Size',       color: 'text-ado-red'   },
          { letter: 'A', nl: 'Activiteit',en: 'Activity',   color: 'text-ado-amber' },
          { letter: 'L', nl: 'Locatie',   en: 'Location',   color: 'text-ado-blue'  },
          { letter: 'U', nl: 'Eenheid',   en: 'Unit',       color: 'text-ado-green' },
          { letter: 'T', nl: 'Tijd',      en: 'Time',       color: 'text-brand-primary' },
          { letter: 'E', nl: 'Uitrusting',en: 'Equipment',  color: 'text-brand-text'    },
        ].map(f => (
          <div key={f.letter} className="bg-brand-bg-elevated border border-brand-border rounded p-2 text-center">
            <p className={clsx('text-lg font-bold font-mono', f.color)}>{f.letter}</p>
            <p className="text-[9px] font-mono text-brand-text-dim mt-0.5">
              {lang === 'nl' ? f.nl : f.en}
            </p>
          </div>
        ))}
      </div>

      {/* ── Process button ── */}
      <div className="flex justify-end pt-1">
        <Button
          variant="primary"
          size="md"
          iconRight="→"
          disabled={!transcript.trim()}
          onClick={() => onProcessToSalute(transcript)}
        >
          {lang === 'nl' ? 'Verwerk naar SALUTE →' : 'Process to SALUTE →'}
        </Button>
      </div>
    </div>
  );
}
