import React, { memo, useState, useEffect } from 'react';
import { Sparkles, RefreshCw, MessageCircle, Heart, Quote, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface AIInsight {
  id: string;
  type: 'icebreaker' | 'respect' | 'quote' | 'urgent';
  title: string;
  content: string;
  icon: React.ReactNode;
  category: string;
}

interface AIInsightsWidgetProps {
  overdueTodos?: any[];
  isMobile?: boolean;
}

const aiInsights: AIInsight[] = [
  {
    id: '1',
    type: 'icebreaker',
    title: '자연스러운 대화 시작',
    content: '"안녕하세요! 오늘 날씨가 참 좋네요. 혹시 어떤 보험에 관심이 있으시거나 궁금한 점이 있으신가요?"',
    icon: <MessageCircle className="w-4 h-4" />,
    category: '아이스브레이킹'
  },
  {
    id: '2',
    type: 'respect',
    title: '고객 존중 표현법',
    content: '"고객님의 소중한 시간을 내어 주셔서 정말 감사합니다. 고객님께 가장 적합한 보험 상품을 찾아드리는 것이 저의 목표입니다."',
    icon: <Heart className="w-4 h-4" />,
    category: '존중 대화법'
  },
  {
    id: '3',
    type: 'quote',
    title: '오늘의 영업 명언',
    content: '"성공적인 영업은 상품을 파는 것이 아니라 고객의 문제를 해결해 주는 것이다." - 지그 지글러',
    icon: <Quote className="w-4 h-4" />,
    category: '오늘의 명언'
  },
  {
    id: '4',
    type: 'icebreaker',
    title: '편안한 분위기 조성',
    content: '"커피나 차 한 잔 드시면서 편안하게 이야기해요. 고객님의 현재 상황을 먼저 들어보고 싶습니다."',
    icon: <MessageCircle className="w-4 h-4" />,
    category: '아이스브레이킹'
  },
  {
    id: '5',
    type: 'respect',
    title: '신뢰 관계 구축',
    content: '"고객님의 개인정보와 상담 내용은 철저히 보호되며, 고객님의 동의 없이는 절대 공유되지 않습니다."',
    icon: <Heart className="w-4 h-4" />,
    category: '존중 대화법'
  },
  {
    id: '6',
    type: 'quote',
    title: '성장 마인드셋',
    content: '"매일 조금씩 성장하는 사람이 결국 큰 성취를 이룬다." - 제임스 클리어',
    icon: <Quote className="w-4 h-4" />,
    category: '오늘의 명언'
  }
];

export const AIInsightsWidget = memo<AIInsightsWidgetProps>(({ overdueTodos = [], isMobile = false }) => {
  const [currentInsight, setCurrentInsight] = useState<AIInsight>(aiInsights[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 긴급 처리 필요한 인사이트 생성
  const urgentInsight: AIInsight = {
    id: 'urgent',
    type: 'urgent',
    title: '긴급 처리 필요',
    content: `기한이 지난 할 일이 ${overdueTodos.length}개 있습니다. 우선 처리하세요.`,
    icon: <AlertCircle className="w-4 h-4" />,
    category: '긴급 알림'
  };

  // 5초마다 자동으로 인사이트 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight(prev => {
        // 긴급 할 일이 있으면 우선 표시
        if (overdueTodos.length > 0 && Math.random() < 0.3) {
          return urgentInsight;
        }

        const currentIndex = aiInsights.findIndex(insight => insight.id === prev.id);
        const nextIndex = (currentIndex + 1) % aiInsights.length;
        return aiInsights[nextIndex];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [overdueTodos.length, urgentInsight]);

  const handleRefresh = () => {
    setIsRefreshing(true);

    // 긴급 할 일이 있으면 50% 확률로 긴급 인사이트 표시
    if (overdueTodos.length > 0 && Math.random() < 0.5) {
      setCurrentInsight(urgentInsight);
    } else {
      const randomIndex = Math.floor(Math.random() * aiInsights.length);
      setCurrentInsight(aiInsights[randomIndex]);
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'icebreaker':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'respect':
        return 'bg-pink-500/20 text-pink-700 dark:text-pink-400';
      case 'quote':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-400';
      case 'urgent':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-400';
    }
  };

  return (
    <Card className={`rounded-3xl shadow-lg border-border overflow-hidden relative group ai-hover-scale ai-glow-effect ai-fade-in ${isMobile ? 'mobile-card-small' : ''}`}>
      {/* 보라색 네온 그라데이션 배경 */}
      <div className="absolute inset-0 ai-neon-gradient" />

      <div className="relative">
        <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-xl'}`}>
              <div className="p-2 rounded-xl ai-icon-gradient text-white shadow-lg">
                <Sparkles className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </div>
              <span className="ai-text-gradient font-bold">
                AI 영업 도우미
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 text-purple-600 dark:text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className={`space-y-4 ${isMobile ? 'mobile-card-content-small' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className={`${getTypeColor(currentInsight.type)} border-0`}>
              {currentInsight.icon}
              <span className="ml-1">{currentInsight.category}</span>
            </Badge>
          </div>

          <div className="space-y-3">
            <h4 className={`font-semibold text-card-foreground ${isMobile ? 'text-sm' : 'text-lg'}`}>
              {currentInsight.title}
            </h4>

            <div className="p-4 rounded-2xl ai-content-bg backdrop-blur-sm">
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed text-card-foreground italic`}>
                {currentInsight.content}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1">
              {aiInsights.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    aiInsights.findIndex(insight => insight.id === currentInsight.id) === index
                      ? 'ai-dot-active shadow-lg'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              AI 추천 • 5초마다 업데이트
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
});

AIInsightsWidget.displayName = 'AIInsightsWidget';