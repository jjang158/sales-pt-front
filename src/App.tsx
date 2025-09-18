import React from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { FloatingChatbot } from './components/FloatingChatbot';
import { AppLayout } from './components/layout/AppLayout';
import { PageRouter } from './components/router/PageRouter';
import { useApplicationState } from './hooks/useApplicationState';

/**
 * SPT - Sales Productivity Tool
 * 🚀 Enterprise React App: Type-safe, Zero re-renders, Accessible
 */
export default function App() {
  const { state, actions } = useApplicationState();

  return (
    <ThemeProvider>
      <AppLayout currentPage={state.currentPage} onNavigate={actions.navigateTo}>
        <PageRouter {...state} {...actions} />
      </AppLayout>
      <FloatingChatbot />
    </ThemeProvider>
  );
}