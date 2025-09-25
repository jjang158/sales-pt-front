import React from 'react';
import { CheckSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useIsMobile } from '../ui/use-mobile';

interface WorkProgressCardProps {
  stats: {
    incomplete: number;
    completed: number;
  };
  onStageClick: (type: string) => void;
}

export function WorkProgressCard({ stats, onStageClick }: WorkProgressCardProps) {
  const isMobile = useIsMobile();

  return (
    <Card className={`rounded-3xl shadow-lg border-border ${isMobile ? 'mx-4' : ''}`}>
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-4">
        <CardTitle className={`${isMobile ? 'text-lg' : ''}`}>
          <div className="flex items-center gap-2">
            <CheckSquare className={`${isMobile ? 'w-4 h-4' : 'w-5'}`} />
            do
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
          {/* DO (할 일) */}
          <button
            className={`text-left bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer group ${
              isMobile ? 'p-4' : 'p-4'
            }`}
            onClick={() => onStageClick('DO')}
          >
            <div className={`flex items-center ${isMobile ? 'justify-between mb-1' : 'justify-between mb-2'}`}>
              {!isMobile && (
                <div className={`bg-orange-500 rounded-full flex items-center justify-center ${
                  isMobile ? 'w-8 h-8' : 'w-10 h-10'
                }`}>
                  <Clock className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </div>
              )}
              <div className="flex items-center gap-3">
                {isMobile && (
                  <div className={`bg-orange-500 rounded-full flex items-center justify-center ${
                    isMobile ? 'w-8 h-8' : 'w-10 h-10'
                  }`}>
                    <Clock className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  </div>
                )}
                <span className="text-sm text-orange-800 dark:text-orange-300">할 일</span>
                <div className={isMobile ? 'text-center' : 'text-right'}>
                  <div className={isMobile ? 'flex items-center justify-center gap-1' : ''}>
                    <p className={`font-bold text-orange-700 dark:text-orange-400 ${
                      isMobile ? 'text-xl' : 'text-2xl'
                    }`}>
                      {stats.incomplete}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-500">개</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className={`font-semibold text-orange-800 dark:text-orange-300 mb-1 ${
                isMobile ? 'text-sm' : 'text-2xl'
              }`}>do</h3>
            </div>
          </button>

          {/* DONE (완료) */}
          <button
            className={`text-left bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer group ${
              isMobile ? 'p-4' : 'p-4'
            }`}
            onClick={() => onStageClick('DONE')}
          >
            <div className={`flex items-center ${isMobile ? 'justify-between mb-1' : 'justify-between mb-2'}`}>
              {!isMobile && (
                <div className={`bg-green-500 rounded-full flex items-center justify-center ${
                  isMobile ? 'w-8 h-8' : 'w-10 h-10'
                }`}>
                  <CheckSquare className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </div>
              )}
              <div className="flex items-center gap-3">
                {isMobile && (
                  <div className={`bg-green-500 rounded-full flex items-center justify-center ${
                    isMobile ? 'w-8 h-8' : 'w-10 h-10'
                  }`}>
                    <CheckSquare className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  </div>
                )}
                <span className="text-sm text-green-800 dark:text-green-300">완료</span>
                <div className={isMobile ? 'text-center' : 'text-right'}>
                  <div className={isMobile ? 'flex items-center justify-center gap-1' : ''}>
                    <p className={`font-bold text-green-700 dark:text-green-400 ${
                      isMobile ? 'text-xl' : 'text-2xl'
                    }`}>
                      {stats.completed}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">개</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className={`font-semibold text-green-800 dark:text-green-300 mb-1 ${
                isMobile ? 'text-sm' : 'text-2xl'
              }`}>done</h3>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}