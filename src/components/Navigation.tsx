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
  { id: 'dashboard' as Page, icon: Home, label: '대시보드', mobileLabel: '홈' },
  { id: 'integrated-customer' as Page, icon: Users, label: '통합 고객 관리', mobileLabel: '고객' },
  { id: 'documents' as Page, icon: FileText, label: '문서 관리', mobileLabel: '문서' },
];

const settingsItem = { id: 'settings' as Page, icon: Settings, label: '설정', mobileLabel: '설정' };

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const isMobile = useIsMobile();


  if (isMobile) {
    return (
      <nav className="md:hidden bg-card border-t border-border shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80 rounded-t-xl">
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto px-safe">
          {[...navigationItems, settingsItem].map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onNavigate(item.id)}
                className={`
                  flex flex-col items-center justify-center gap-1 p-2 touch-target h-full
                  transition-colors duration-200 rounded-none
                  ${
                    isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                  }
                `}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                  {item.mobileLabel}
                </span>
              </Button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <TooltipProvider>
      <nav className="hidden md:flex w-20 h-full shadow-lg relative overflow-visible bg-card border-r border-border rounded-r-2xl">
        <div className="flex flex-col items-center justify-between w-full h-full py-6">
          {/* Top Section: Logo + Navigation Items */}
        <div className="flex flex-col items-center gap-8 flex-shrink-0">
          {/* Logo */}
          <div className="w-full flex justify-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-white">
              <img
                src="/logo.svg"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-4 items-center">
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
                            ? 'bg-white text-green-700 shadow-xl scale-110 ring-2 ring-white/80'
                            : 'bg-green-500/20 text-green-100 hover:bg-green-700/70 hover:text-white hover:shadow-lg'
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
        </div>

        {/* Bottom Section: Settings and Theme Toggle */}
        <div className="flex flex-col gap-4 items-center flex-shrink-0">
          <div className="relative">
            {/* 설정 페이지 연결선 */}
            {currentPage === settingsItem.id && (
              <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-0.5 bg-gradient-to-r from-white to-transparent rounded-full animate-pulse" />
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-12 h-12 p-0 rounded-2xl transition-all duration-300 relative transform hover:scale-110 ${
                    currentPage === settingsItem.id
                      ? 'bg-white text-green-700 shadow-xl scale-110 ring-2 ring-white/80'
                      : 'bg-green-500/20 text-green-100 hover:bg-green-700/70 hover:text-white hover:shadow-lg'
                  }`}
                  onClick={() => onNavigate(settingsItem.id)}
                >
                  <settingsItem.icon className={`w-5 h-5 transition-transform duration-300 ${currentPage === settingsItem.id ? 'scale-110' : ''}`} />

                  {/* 활성 상태 표시기 */}
                  {currentPage === settingsItem.id && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-bounce shadow-lg" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                <p>{settingsItem.label}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <ThemeToggle />
        </div>
      </div>
      </nav>
    </TooltipProvider>
  );
}