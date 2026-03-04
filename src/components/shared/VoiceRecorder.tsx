// ============================================================
// VoiceRecorder — ADO Shared Component
// Reusable voice capture UI. Wraps useVoiceRecorder hook.
// Used in: LiveBriefing (WP05) + VoiceReport (WP07)
//
// Props let the parent control what happens with the transcript.
// The hook state is lifted up via onTranscriptChange so the
// parent module can pass it to Claude.
// ============================================================

import { useEffect }           from 'react';
import { useVoiceRecorder, formatTime } from '../../hooks/useVoiceRecorder';
import { useLanguage }         from '../../config/i18n';
import clsx                    from 'clsx';

interface VoiceRecorderProps {
  // Called every time final transcript changes
  onTranscriptChange?: (transcript: string) => void;
  // Called when user explicitly stops — parent can trigger AI processing
  onStop?: (transcript: string) => void;
  // Override label shown inside button
  label?: { nl: string; en: string };
  // Compact mode (no waveform, smaller layout) — for Field Report
  compact?: boolean;
  className?: string;
}

// ── Animated waveform bars ───────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  const bars = [3, 5, 8, 5, 9, 4, 7, 5, 6, 4, 8, 5, 3, 6, 9, 5, 7, 4, 6, 3];
  return (
    <div className="flex items-center gap-[2px] h-8">
      {bars.map((h, i) => (
        <span
          key={i}
          className={clsx(
            'w-[2px] rounded-full transition-all',
            active
              ? 'bg-ado-red'
              : 'bg-brand-text-dim/30',
          )}
          style={{
            height: active ? `${h * 3}px` : '4px',
            animationDelay: `${i * 40}ms`,
            animation: active
              ? `waveBar 0.8s ease-in-out ${i * 40}ms infinite alternate`
              : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

// ── Mic pulse ring ────────────────────────────────────────────
function MicButton({
  isRecording,
  isSupported,
  onClick,
}: {
  isRecording: boolean;
  isSupported: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!isSupported}
      className={clsx(
        'relative w-14 h-14 rounded-full flex items-center justify-center',
        'transition-all duration-300 focus-visible:outline focus-visible:outline-2',
        'focus-visible:outline-brand-primary/60 disabled:opacity-40 disabled:cursor-not-allowed',
        isRecording
          ? 'bg-ado-red text-white shadow-[0_0_24px_rgba(239,68,68,0.5)]'
          : 'bg-brand-bg-elevated border border-brand-border text-brand-text-bright hover:border-brand-primary/40 hover:text-brand-primary',
      )}
      aria-label={isRecording ? 'Stop opname' : 'Start opname'}
    >
      {/* Pulse rings when recording */}
      {isRecording && (
        <>
          <span className="absolute inset-0 rounded-full bg-ado-red/20 animate-ping" />
          <span className="absolute inset-[-6px] rounded-full border border-ado-red/30 animate-pulse" />
        </>
      )}
      {/* Icon */}
      <svg
        width="22" height="22" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        className="relative z-10"
      >
        {isRecording ? (
          // Stop square
          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />
        ) : (
          // Microphone
          <>
            <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8"  y1="23" x2="16" y2="23" />
          </>
        )}
      </svg>
    </button>
  );
}

// ── Main VoiceRecorder component ─────────────────────────────
export function VoiceRecorder({
  onTranscriptChange,
  onStop,
  label,
  compact = false,
  className,
}: VoiceRecorderProps) {
  const { lang } = useLanguage();
  const {
    transcript,
    interimText,
    isRecording,
    isSupported,
    elapsedTime,
    start,
    stop,
    reset,
  } = useVoiceRecorder();

  // Notify parent on every transcript change
  useEffect(() => {
    onTranscriptChange?.(transcript);
  }, [transcript, onTranscriptChange]);

  function handleToggle() {
    if (isRecording) {
      stop();
      onStop?.(transcript);
    } else {
      reset();
      start();
    }
  }

  const defaultLabel = {
    nl: isRecording ? 'Stop & Verwerk' : 'Start Opname',
    en: isRecording ? 'Stop & Process' : 'Start Recording',
  };
  const btnLabel = label ?? defaultLabel;

  if (!isSupported) {
    return (
      <div className={clsx(
        'bg-ado-amber/10 border border-ado-amber/25 rounded-lg p-4 text-center',
        className,
      )}>
        <p className="text-ado-amber text-xs font-mono">
          {lang === 'nl'
            ? '⚠️ Web Speech API niet ondersteund in deze browser. Gebruik Chrome of Edge.'
            : '⚠️ Web Speech API not supported in this browser. Use Chrome or Edge.'}
        </p>
      </div>
    );
  }

  if (compact) {
    // ── Compact layout (Field Report) ───────────────────
    return (
      <div className={clsx('flex items-center gap-4', className)}>
        <MicButton isRecording={isRecording} isSupported={isSupported} onClick={handleToggle} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx(
              'text-xs font-mono font-semibold',
              isRecording ? 'text-ado-red' : 'text-brand-text-dim',
            )}>
              {isRecording
                ? `${lang === 'nl' ? 'OPNAME' : 'RECORDING'} ${formatTime(elapsedTime)}`
                : btnLabel[lang]}
            </span>
            {isRecording && <Waveform active />}
          </div>
          {(transcript || interimText) && (
            <p className="text-brand-text text-[11px] font-mono line-clamp-2 leading-relaxed">
              {transcript}
              {interimText && (
                <span className="text-brand-text-dim italic"> {interimText}</span>
              )}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Full layout (Live Briefing) ──────────────────────
  return (
    <div className={clsx('space-y-4', className)}>
      {/* Controls row */}
      <div className="flex items-center gap-5">
        <MicButton isRecording={isRecording} isSupported={isSupported} onClick={handleToggle} />

        <div className="flex-1">
          {/* Status + timer */}
          <div className="flex items-center gap-3 mb-2">
            <span className={clsx(
              'text-xs font-mono font-bold uppercase tracking-wide',
              isRecording ? 'text-ado-red' : 'text-brand-text-dim',
            )}>
              {isRecording
                ? (lang === 'nl' ? 'OPNAME ACTIEF' : 'RECORDING ACTIVE')
                : btnLabel[lang]}
            </span>
            <span className="font-mono text-sm text-brand-text-bright tabular-nums">
              {formatTime(elapsedTime)}
            </span>
            {isRecording && (
              <span className="text-[10px] font-mono text-brand-text-dim">
                {lang === 'nl' ? '— spreek duidelijk' : '— speak clearly'}
              </span>
            )}
          </div>

          {/* Waveform */}
          <Waveform active={isRecording} />
        </div>

        {/* Reset button — only when there's content */}
        {(transcript || elapsedTime > 0) && !isRecording && (
          <button
            onClick={reset}
            className="text-[11px] font-mono text-brand-text-dim hover:text-ado-red transition-colors"
            title={lang === 'nl' ? 'Wis opname' : 'Clear recording'}
          >
            🗑️ {lang === 'nl' ? 'Wis' : 'Clear'}
          </button>
        )}
      </div>

      {/* Transcript display */}
      <div className={clsx(
        'min-h-[80px] rounded-lg border p-3 transition-all duration-300',
        isRecording
          ? 'bg-ado-red/5 border-ado-red/20'
          : 'bg-brand-bg-elevated border-brand-border',
      )}>
        {transcript || interimText ? (
          <p className="text-brand-text text-xs font-mono leading-relaxed whitespace-pre-wrap">
            {transcript}
            {interimText && (
              <span className="text-brand-text-dim italic opacity-70"> {interimText}</span>
            )}
          </p>
        ) : (
          <p className="text-brand-text-dim text-xs font-mono italic">
            {isRecording
              ? (lang === 'nl' ? 'Luistert naar spraak...' : 'Listening for speech...')
              : (lang === 'nl' ? 'Transcriptie verschijnt hier...' : 'Transcript will appear here...')}
          </p>
        )}
      </div>
    </div>
  );
}
