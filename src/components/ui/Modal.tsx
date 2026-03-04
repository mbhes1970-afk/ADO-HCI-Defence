// ============================================================
// Modal — ADO UI Component Library
// Generic modal shell. Closes on Escape + backdrop click.
// Used by: ExportModal, C2Modal, ConfirmDialog
// ============================================================

import React, { useEffect, useCallback } from 'react';
import clsx from 'clsx';

interface ModalProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  subtitle?:  string;
  children:   React.ReactNode;
  footer?:    React.ReactNode;
  size?:      'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size      = 'md',
  className,
}: ModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel — stop propagation so clicking inside doesn't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          'relative w-full bg-brand-bg-card border border-brand-border rounded-xl',
          'shadow-[0_24px_80px_rgba(0,0,0,0.6)]',
          'animate-fade-in',
          sizeStyles[size],
          className,
        )}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-brand-border">
            <div>
              {title && (
                <h2 className="text-brand-text-bright font-semibold text-base">{title}</h2>
              )}
              {subtitle && (
                <p className="text-brand-text-dim text-xs font-mono mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-brand-text-dim hover:text-brand-text-bright transition-colors ml-4 flex-shrink-0 mt-0.5"
              aria-label="Sluiten"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 pb-5 pt-2 border-t border-brand-border flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Confirm Dialog ───────────────────────────────────────────
interface ConfirmDialogProps {
  open:        boolean;
  onClose:     () => void;
  onConfirm:   () => void;
  title:       string;
  message:     string;
  confirmText?: string;
  danger?:     boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmText = 'Bevestigen', danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title={title}>
      <p className="text-brand-text text-sm mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-mono text-brand-text-dim hover:text-brand-text-bright
                     bg-brand-bg-elevated border border-brand-border rounded transition-colors"
        >
          Annuleer
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={clsx(
            'px-3 py-1.5 text-xs font-mono font-semibold rounded transition-colors',
            danger
              ? 'bg-ado-red/10 border border-ado-red/30 text-ado-red hover:bg-ado-red/20'
              : 'bg-brand-primary text-brand-bg hover:bg-brand-primary-light',
          )}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
