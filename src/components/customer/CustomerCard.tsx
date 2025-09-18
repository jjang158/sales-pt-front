import React from 'react';
import { ArrowRight, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';

interface CustomerCardProps {
  customer: {
    id: string;
    name: string;
    avatar: string;
    interestedProduct: string;
    stage: string;
    email: string;
    phone: string;
    realConsultCount?: number;
    realActionCount?: number;
    realPendingCount?: number;
    latestVoice?: string;
    voiceSummaries: Array<{
      id: string;
      meetingType: string;
      date: string;
      summary: string;
      sentiment: string;
    }>;
    totalActivities: number;
    pendingTasks: number;
  };
  onSelect: (customerId: string) => void;
  onStartRecording?: (context: { type: 'task' | 'customer'; name: string; id: string }) => void;
}

export function CustomerCard({ customer, onSelect, onStartRecording }: CustomerCardProps) {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'prospect': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'opportunity': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'customer': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageName = (stage: string) => {
    switch (stage) {
      case 'lead': return '리드';
      case 'prospect': return '잠재고객';
      case 'opportunity': return '기회';
      case 'customer': return '고객';
      default: return stage;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card 
      className="rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group" 
      onClick={() => onSelect(customer.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>{customer.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{customer.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{customer.interestedProduct}</p>
            </div>
          </div>
          <Badge variant="outline" className={`rounded-full text-xs ${getStageColor(customer.stage)}`}>
            {getStageName(customer.stage)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold">
              {customer.realConsultCount || customer.voiceSummaries.length}
            </div>
            <div className="text-xs text-muted-foreground">상담 수</div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {customer.realActionCount || customer.totalActivities}
            </div>
            <div className="text-xs text-muted-foreground">처리 완료</div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {customer.realPendingCount || customer.pendingTasks}
            </div>
            <div className="text-xs text-muted-foreground">대기 작업</div>
          </div>
        </div>

        <Separator />

        {/* 실제 API 데이터가 있으면 표시, 없으면 mock 데이터 표시 */}
        {customer.latestVoice ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">최근 상담 내용</span>
            </div>
            <div className="bg-muted rounded-lg p-3 border border-border/50">
              <p className="text-sm line-clamp-2">{customer.latestVoice}</p>
            </div>
          </div>
        ) : customer.voiceSummaries.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">최근 음성 요약</span>
              <Badge variant="outline" className={`text-xs ${getSentimentColor(customer.voiceSummaries[0].sentiment)}`}>
                {customer.voiceSummaries[0].sentiment}
              </Badge>
            </div>
            <div className="bg-muted rounded-lg p-3 border border-border/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {customer.voiceSummaries[0].meetingType}
                </span>
                <span className="text-xs text-muted-foreground">
                  {customer.voiceSummaries[0].date}
                </span>
              </div>
              <p className="text-sm line-clamp-2">{customer.voiceSummaries[0].summary}</p>
            </div>
          </div>
        ) : null}

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(customer.id);
            }}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            관리
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              onStartRecording?.({ type: 'customer', name: customer.name, id: customer.id });
            }}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}