// ============================================================
// Layout — ADO
// Main app shell: Sidebar (fixed left) + TopBar (sticky top) + content
// ============================================================

import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar }  from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <div className="ml-56 flex flex-col min-h-screen">
        {/* Sticky top bar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 p-6 relative z-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="
          border-t border-brand-border px-6 py-3
          flex items-center justify-between
          text-[11px] text-brand-text-dim font-mono
        ">
          <span>© {new Date().getFullYear()} HES Consultancy International</span>
          <span className="text-brand-text-dim">
            AI Defence Operations · Nxt Era Solutions
          </span>
        </footer>
      </div>
    </div>
  );
}
