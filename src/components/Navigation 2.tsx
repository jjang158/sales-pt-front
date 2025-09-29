import React from 'react';
import { Home, Settings, Users, Leaf, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ThemeToggle } from './ThemeToggle';
import { useIsMobile } from './ui/use-mobile';
import type { Page } from '../types/index';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navigationItems = [
  { id: 'dashboard' as Page, icon: Home, label: '대시보드' },
  { id: 'integrated-customer' as Page, icon: Users, label: '통합 고객 관리' },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 safe-area-pb">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 p-2 h-auto min-w-[60px] ${
                  isActive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 p-2 h-auto min-w-[60px] ${
              currentPage === 'settings'
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => onNavigate('settings')}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">설정</span>
          </Button>
        </div>
      </nav>
    );
  }

  return (
    <TooltipProvider>
      <nav className="w-20 shadow-2xl shadow-lime-500/20 flex flex-col items-center py-6 rounded-l-3xl relative overflow-visible" style={{ backgroundColor: '#1BA109' }}>
        {/* Logo */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-white">
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-4 flex-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <div key={item.id} className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-12 h-12 p-0 rounded-2xl transition-all duration-200 relative group ${
                        isActive
                          ? 'bg-gradient-to-br from-green-100 to-green-50 text-green-800 shadow-lg'
                          : 'text-green-200 hover:bg-green-700/50 hover:text-white'
                      }`}
                      onClick={() => onNavigate(item.id)}
                    >
                      <Icon className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </div>

        {/* Bottom Section: Settings and Theme Toggle */}
        <div className="mt-auto flex flex-col gap-4 items-center">
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-12 h-12 p-0 rounded-2xl transition-all duration-200 relative ${
                    currentPage === 'settings'
                      ? 'bg-gradient-to-br from-green-100 to-green-50 text-green-800 shadow-lg'
                      : 'hover:bg-green-700/50 text-green-200 hover:text-white'
                  }`}
                  onClick={() => onNavigate('settings')}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                <p>설정</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <ThemeToggle />
        </div>
      </nav>
    </TooltipProvider>
  );
}