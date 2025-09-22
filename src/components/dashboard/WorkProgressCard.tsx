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
    <Card className={`rounded-2xl shadow-lg ${isMobile ? 'mx-4' : ''}`}>
      <CardHeader className={`${isMobile ? 'pt-4 pb-2' : '!pt-1 !pb-1'}`}>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
          <CheckSquare className={`${isMobile ? 'w-4 h-4' : 'w-5'}`} />
          업무 진행 현황
        </CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-4 pt-0' : 'p-4 pt-0'}`}>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {/* DO (할 일) */}
          <button
            className={`text-left bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer group ${
              isMobile ? 'p-4' : 'p-6'
            }`}
            onClick={() => onStageClick('DO')}
          >
            <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-4'}`}>
              <div className={`bg-orange-500 rounded-full flex items-center justify-center ${
                isMobile ? 'w-8 h-8' : 'w-10 h-10'
              }`}>
                <Clock className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </div>
              <div className="text-right">
                <p className={`font-bold text-orange-700 dark:text-orange-400 ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>
                  {stats.incomplete}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-500">개</p>
              </div>
            </div>
            <div>
              <h3 className={`font-semibold text-orange-800 dark:text-orange-300 mb-1 ${
                isMobile ? 'text-sm' : ''
              }`}>할 일 (DO)</h3>
              <p className={`text-orange-600 dark:text-orange-400 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                진행해야 할 업무들
              </p>
            </div>
          </button>

          {/* DONE (완료) */}
          <button
            className={`text-left bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer group ${
              isMobile ? 'p-4' : 'p-6'
            }`}
            onClick={() => onStageClick('DONE')}
          >
            <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-4'}`}>
              <div className={`bg-green-500 rounded-full flex items-center justify-center ${
                isMobile ? 'w-8 h-8' : 'w-10 h-10'
              }`}>
                <CheckSquare className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </div>
              <div className="text-right">
                <p className={`font-bold text-green-700 dark:text-green-400 ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>
                  {stats.completed}
                </p>
                <p className="text-xs text-green-600 dark:text-green-500">개</p>
              </div>
            </div>
            <div>
              <h3 className={`font-semibold text-green-800 dark:text-green-300 mb-1 ${
                isMobile ? 'text-sm' : ''
              }`}>완료 (DONE)</h3>
              <p className={`text-green-600 dark:text-green-400 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                완료된 업무들
              </p>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}