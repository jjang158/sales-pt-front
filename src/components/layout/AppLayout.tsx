import React, { memo } from 'react';
import { Navigation } from '../Navigation';
import { AppHeader } from './AppHeader';
import type { Page } from '../../types/index';

interface AppLayoutProps {
  readonly currentPage: Page;
  readonly onNavigate: (page: Page) => void;
  readonly children: React.ReactNode;
}

/**
 * Responsive tablet-optimized layout shell
 */
export const AppLayout = memo<AppLayoutProps>(({ currentPage, onNavigate, children }) => (
  <div className="h-screen bg-background p-6 transition-colors duration-300">
    <div className="h-full bg-card rounded-3xl shadow-xl border border-border/50 flex overflow-hidden relative">
      <Navigation currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-h-0">
        <AppHeader />
        <main className="flex-1 min-h-0 bg-background/50 page-container">
          {children}
        </main>
      </div>
    </div>
  </div>
));