import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

export function SalesStageCard() {
  const salesStages = [
    { name: 'TA(상담 약속 잡기)', count: 45, percentage: 22 },
    { name: 'AP(정보 수집)', count: 38, percentage: 18 },
    { name: 'PT(상품 제안)', count: 32, percentage: 16 },
    { name: 'CL(청약 제안)', count: 28, percentage: 14 },
    { name: '청약(출금 및 제출)', count: 24, percentage: 12 },
    { name: '증권 전달(리뷰)', count: 19, percentage: 9 }
  ];

  return (
    <Card className="rounded-3xl shadow-lg border-border">
      <CardHeader className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-4">
        <CardTitle className="text-base">
          영업 단계별 현황
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {salesStages.map((stage, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{stage.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{stage.count}번</span>
                <span className="text-sm font-semibold">{stage.percentage}%</span>
              </div>
            </div>
            <Progress value={stage.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}