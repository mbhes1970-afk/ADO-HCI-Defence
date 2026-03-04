// ============================================================
// useVoiceRecorder — ADO
// Reusable Web Speech API hook.
// Used in: LiveBriefing (WP05) + VoiceReport (WP07)
// Language follows the active LanguageContext (nl-NL / en-US)
// ============================================================

import { useState, useRef, useCallback } from 'react';
import { useLanguage }                   from '../config/i18n';

interface UseVoiceRecorderResult {
  transcript:   string;
  interimText:  string;
  isRecording:  boolean;
  isSupported:  boolean;
  elapsedTime:  number;     // seconds
  start:        () => void;
  stop:         () => void;
  reset:        () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const { lang }           = useLanguage();
  const [transcript,   setTranscript]   = useState('');
  const [interimText,  setInterimText]  = useState('');
  const [isRecording,  setIsRecording]  = useState(false);
  const [elapsedTime,  setElapsedTime]  = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback(() => {
    if (!isSupported) return;

    const SR = (window.SpeechRecognition || window.webkitSpeechRecognition) as typeof SpeechRecognition;
    const recognition = new SR();

    // Language follows active locale — nl-NL or en-US
    recognition.lang            = lang === 'nl' ? 'nl-NL' : 'en-US';
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText   = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + ' ';
        } else {
          currentInterim += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript((prev) => prev + finalText);
      }
      setInterimText(currentInterim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('[useVoiceRecorder] error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      // Auto-restart if still in recording state (browser stops after silence)
      if (recognitionRef.current) {
        try { recognition.start(); } catch { /* already stopped */ }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setElapsedTime(0);

    // Timer
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, [isSupported, lang]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // prevent auto-restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setInterimText('');
  }, []);

  const reset = useCallback(() => {
    stop();
    setTranscript('');
    setInterimText('');
    setElapsedTime(0);
  }, [stop]);

  return { transcript, interimText, isRecording, isSupported, elapsedTime, start, stop, reset };
}

// ── Format seconds → MM:SS ──────────────────────────────────
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
