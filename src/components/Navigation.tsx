import { Home, Settings, Users, FileText } from 'lucide-react';
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
  { id: 'documents' as Page, icon: FileText, label: '문서 관리' },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-green-500 dark:bg-green-700 backdrop-blur-md border-t border-green-400 dark:border-green-600 z-50">
        <div className="flex items-center justify-between px-4 py-2 w-full max-w-md mx-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <div key={item.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center gap-1 p-3 h-auto w-16 rounded-xl transition-all duration-300 relative ${
                    isActive
                      ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-700 dark:text-green-400 shadow-lg scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                  }`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-xs font-medium leading-tight">
                    {item.id === 'integrated-customer' ? '고객' :
                     item.id === 'documents' ? '문서' :
                     item.label.split(' ')[0]}
                  </span>

                  {/* 활성 상태 표시 점 */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-md" />
                  )}
                </Button>
              </div>
            );
          })}

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 p-3 h-auto w-16 rounded-xl transition-all duration-300 relative ${
                currentPage === 'settings'
                  ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-700 dark:text-green-400 shadow-lg scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
              }`}
              onClick={() => onNavigate('settings')}
            >
              <Settings className={`w-5 h-5 transition-transform duration-300 ${currentPage === 'settings' ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium leading-tight">설정</span>

              {/* 활성 상태 표시 점 */}
              {currentPage === 'settings' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-md" />
              )}
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <TooltipProvider>
      <nav className="w-20 shadow-2xl shadow-lime-500/20 flex flex-col items-center py-6 rounded-l-3xl relative overflow-visible bg-green-600 dark:bg-green-800">
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
                {/* 활성 페이지 연결선 */}
                {isActive && (
                  <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-0.5 bg-gradient-to-r from-white to-transparent rounded-full animate-pulse" />
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-12 h-12 p-0 rounded-2xl transition-all duration-300 relative group transform hover:scale-110 ${
                        isActive
                          ? 'bg-gradient-to-br from-white to-green-50 text-green-700 shadow-xl scale-110 ring-2 ring-white/50'
                          : 'text-green-200 hover:bg-green-700/50 hover:text-white hover:shadow-lg'
                      }`}
                      onClick={() => onNavigate(item.id)}
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />

                      {/* 활성 상태 표시기 */}
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-bounce shadow-lg" />
                      )}
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
            {/* 설정 페이지 연결선 */}
            {currentPage === 'settings' && (
              <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-0.5 bg-gradient-to-r from-white to-transparent rounded-full animate-pulse" />
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-12 h-12 p-0 rounded-2xl transition-all duration-300 relative transform hover:scale-110 ${
                    currentPage === 'settings'
                      ? 'bg-gradient-to-br from-white to-green-50 text-green-700 shadow-xl scale-110 ring-2 ring-white/50'
                      : 'hover:bg-green-700/50 text-green-200 hover:text-white hover:shadow-lg'
                  }`}
                  onClick={() => onNavigate('settings')}
                >
                  <Settings className={`w-5 h-5 transition-transform duration-300 ${currentPage === 'settings' ? 'scale-110' : ''}`} />

                  {/* 활성 상태 표시기 */}
                  {currentPage === 'settings' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-bounce shadow-lg" />
                  )}
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