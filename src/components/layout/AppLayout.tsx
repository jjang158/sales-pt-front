import React, { memo } from 'react';
import { Navigation } from '../Navigation';
import { AppHeader } from './AppHeader';
import { useIsMobile } from '../ui/use-mobile';
import type { Page } from '../../types/index';

interface AppLayoutProps {
  readonly currentPage: Page;
  readonly onNavigate: (page: Page) => void;
  readonly children: React.ReactNode;
}

/**
 * Responsive layout shell - automatically switches between desktop and mobile layouts
 */
export const AppLayout = memo<AppLayoutProps>(({ currentPage, onNavigate, children }) => {
  const isMobile = useIsMobile();
  const isLoginPage = currentPage === 'login';

  if (isLoginPage) {
    return (
      <div className="mobile-scroll-container bg-background flex flex-col safe-area-inset">
        <main className="flex-1 bg-background page-container overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="mobile-scroll-container bg-background flex flex-col safe-area-top safe-area-left safe-area-right">
        <AppHeader />
        <main className="flex-1 bg-background page-container overflow-auto pb-24 safe-area-bottom">
          {children}
        </main>
        <Navigation currentPage={currentPage} onNavigate={onNavigate} />
      </div>
    );
  }

  return (
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
  );
});