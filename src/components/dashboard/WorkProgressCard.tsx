import React from 'react';
import { CheckSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface WorkProgressCardProps {
  stats: {
    incomplete: number;
    completed: number;
  };
  onStageClick: (type: string) => void;
}

export function WorkProgressCard({ stats, onStageClick }: WorkProgressCardProps) {
  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="!pt-1 !pb-1">
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="w-5" />
          업무 진행 현황
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DO (할 일) */}
          <button
            className="text-left p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer group"
            onClick={() => onStageClick('DO')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                  {stats.incomplete}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-500">개</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-1">할 일 (DO)</h3>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                진행해야 할 업무들
              </p>
            </div>
          </button>

          {/* DONE (완료) */}
          <button
            className="text-left p-6 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer group"
            onClick={() => onStageClick('DONE')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {stats.completed}
                </p>
                <p className="text-xs text-green-600 dark:text-green-500">개</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-1">완료 (DONE)</h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                완료된 업무들
              </p>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}