import { memo } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { useIsMobile } from '../ui/use-mobile';

/**
 * Clean, accessible application header
 */
export const AppHeader = memo(() => {
  const isMobile = useIsMobile();

  return (
    //서비스 명 색 변경 (그라데이션-그린 > 검은색 단색)
    <header className={`bg-card/95 dark:bg-card/50 backdrop-blur-sm border-b border-border/50 dark:border-border/20 mobile-safe-top mobile-safe-left mobile-safe-right`}>
      <div className={`px-6 flex items-center justify-between ${isMobile ? 'py-2' : 'py-4'}`}>
   <h1
  className="font-bold select-none text-black dark:text-white text-2xl"
  style={{
    fontFamily: '"RiaSans", "Noto Sans KR", "Noto Sans", sans-serif',
    fontWeight: 700,
  }}
>
  샐러리
</h1>
    
    <div className="flex items-center gap-4">
      <button
        className="hidden md:block relative p-2 hover:bg-accent rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="알림 확인 (읽지 않은 알림 1개)"
      >
        <Bell className="hidden md:block w-5 h-5 text-muted-foreground" />
        <span className="hidden md:block absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" aria-hidden="true" />
      </button>
      
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-full flex items-center justify-center"
          role="img"
          aria-label="사용자 프로필 이미지"
        >
          <span className="text-white text-sm font-medium select-none">영담</span>
        </div>
        <button 
          className="flex items-center gap-2 hover:bg-accent rounded-lg px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="사용자 메뉴 열기"
        >
          <span className="text-sm font-medium text-foreground">영업 담당자</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
      </div>
    </header>
  );
});