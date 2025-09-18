import React from 'react';
import { CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface AIRecommendationCardProps {
  overdueTodos: any[];
}

export function AIRecommendationCard({ overdueTodos }: AIRecommendationCardProps) {
  return (
    <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-fuchsia-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-white">
          <CheckSquare className="w-4 h-4" />
          AI 추천
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2">
          {overdueTodos.length > 0 && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-white/70 dark:bg-black/20 hover:bg-white/90 dark:hover:bg-black/30 transition-colors cursor-pointer">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-medium">!</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-purple-900 dark:text-purple-100 leading-tight">
                  오늘의 아이스 브레이킹
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300 leading-tight mt-0.5">
                  오늘따라 화사하신 거 같아요! 덕분에 분위기가 환해졌어요~
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-2 rounded-lg bg-white/70 dark:bg-black/20 hover:bg-white/90 dark:hover:bg-black/30 transition-colors cursor-pointer">
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-medium">1</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-purple-900 dark:text-purple-100 leading-tight">
                전화 상담 팁
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300 leading-tight mt-0.5">
                목소리 톤을 평소보다 10% 높이고 미소 지으며 통화
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
