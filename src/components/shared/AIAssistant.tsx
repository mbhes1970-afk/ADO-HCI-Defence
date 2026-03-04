// ============================================================
// AIAssistant — ADO Shared Component
// Reusable chat widget that calls Claude via ado-proxy.
// Used in: PreBrief, LiveBriefing, OpordBuilder, Field Report
//
// Props:
//   systemPrompt  — defines the AI's role/context per module
//   quickActions  — preset buttons that inject a message
//   placeholder   — input placeholder text
//   initialMsg    — optional greeting message on mount
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage }  from '../../config/i18n';
import { useAI }        from '../../hooks/useAI';
import { Button }       from '../ui/Button';
import { Badge }        from '../ui/Badge';
import clsx             from 'clsx';

interface QuickAction {
  label: string;
  message: string;
}

interface AIAssistantProps {
  systemPrompt:  string;
  quickActions?: QuickAction[];
  placeholder?:  { nl: string; en: string };
  initialMsg?:   { nl: string; en: string };
  className?:    string;
  // Inject external context (e.g. transcript from voice recorder)
  contextData?:  string;
}

interface Message {
  role:    'user' | 'assistant';
  content: string;
}

// ── Message bubble ───────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={clsx(
      'flex gap-2 animate-fade-in',
      isUser ? 'flex-row-reverse' : 'flex-row',
    )}>
      {/* Avatar */}
      <div className={clsx(
        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold font-mono',
        isUser
          ? 'bg-brand-bg-elevated border border-brand-border text-brand-text-dim'
          : 'bg-brand-primary text-brand-bg',
      )}>
        {isUser ? 'U' : 'AI'}
      </div>
      {/* Bubble */}
      <div className={clsx(
        'max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed',
        isUser
          ? 'bg-brand-bg-elevated border border-brand-border text-brand-text-bright'
          : 'bg-brand-primary-dim border border-brand-primary/20 text-brand-text-bright',
      )}>
        <p className="whitespace-pre-wrap font-mono">{msg.content}</p>
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-2 animate-fade-in">
      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-brand-primary text-brand-bg text-[10px] font-bold font-mono flex-shrink-0 mt-0.5">
        AI
      </div>
      <div className="bg-brand-primary-dim border border-brand-primary/20 rounded-lg px-3 py-2.5 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export function AIAssistant({
  systemPrompt,
  quickActions = [],
  placeholder,
  initialMsg,
  className,
  contextData,
}: AIAssistantProps) {
  const { lang }        = useLanguage();
  const { loading, call } = useAI();
  const [messages, setMessages] = useState<Message[]>(() => {
    if (!initialMsg) return [];
    return [{ role: 'assistant', content: initialMsg[lang] }];
  });
  const [input, setInput]       = useState('');
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');

    // Build context-enriched system prompt
    const fullSystem = contextData
      ? `${systemPrompt}\n\n[CONTEXT DATA]\n${contextData}`
      : systemPrompt;

    const response = await call({
      system:   fullSystem,
      messages: nextMessages,
    });

    if (response) {
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    }
  }, [messages, loading, call, systemPrompt, contextData]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const defaultPlaceholder = {
    nl: 'Stel een vraag aan de AI assistent...',
    en: 'Ask the AI assistant a question...',
  };
  const ph = placeholder ?? defaultPlaceholder;

  return (
    <div className={clsx(
      'flex flex-col bg-brand-bg-card border border-brand-border rounded-lg overflow-hidden',
      className,
    )}>
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-brand-border bg-brand-bg-elevated">
        <span className="text-sm">🤖</span>
        <span className="text-xs font-semibold text-brand-text-bright">
          {lang === 'nl' ? 'AI Assistent' : 'AI Assistant'}
        </span>
        <Badge variant="ai" size="xs" dot pulse>Claude</Badge>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[160px] max-h-[320px]">
        {messages.length === 0 && !loading && (
          <p className="text-brand-text-dim text-[11px] font-mono text-center py-4 italic">
            {lang === 'nl'
              ? 'Stel een vraag of gebruik een snelkoppeling hieronder.'
              : 'Ask a question or use a quick action below.'}
          </p>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick actions ── */}
      {quickActions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-brand-border/60">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => sendMessage(action.message)}
              disabled={loading}
              className="
                px-2 py-1 text-[10px] font-mono rounded border
                border-brand-primary/25 text-brand-primary bg-brand-primary-dim
                hover:bg-brand-primary-dim/80 hover:border-brand-primary/40
                transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="flex items-end gap-2 px-3 py-2 border-t border-brand-border">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={ph[lang]}
          rows={1}
          disabled={loading}
          className="
            flex-1 bg-brand-bg-elevated border border-brand-border rounded
            px-3 py-2 text-xs font-mono text-brand-text-bright
            placeholder:text-brand-text-dim resize-none
            focus:outline-none focus:border-brand-primary/40
            disabled:opacity-50
            min-h-[34px] max-h-[80px]
          "
          style={{ height: 'auto' }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 80) + 'px';
          }}
        />
        <Button
          variant="primary"
          size="sm"
          loading={loading}
          onClick={() => sendMessage(input)}
          disabled={!input.trim()}
          className="flex-shrink-0 self-end"
        >
          →
        </Button>
      </div>
    </div>
  );
}
