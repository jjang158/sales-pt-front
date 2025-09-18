import React from 'react';
import { ChevronLeft, Mail, Phone, Calendar, FileText, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';

interface CustomerSidebarProps {
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
    voiceSummaries: Array<any>;
    totalActivities: number;
    pendingTasks: number;
    completedTasks: number;
  };
  onBack: () => void;
}

export function CustomerSidebar({ customer, onBack }: CustomerSidebarProps) {
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

  return (
    <div className="w-80 border-r bg-muted/20 p-6 space-y-6">
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 rounded-xl"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          목록으로
        </Button>
        
        <Avatar className="w-16 h-16 mx-auto mb-3">
          <AvatarFallback>{customer.avatar}</AvatarFallback>
        </Avatar>
        
        <h2 className="text-xl font-semibold">{customer.name}</h2>
        <p className="text-sm text-muted-foreground mb-2">{customer.interestedProduct}</p>
        <Badge variant="outline" className={`rounded-full ${getStageColor(customer.stage)}`}>
          {getStageName(customer.stage)}
        </Badge>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">연락처 정보</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">프로젝트 현황</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-background rounded-lg p-3">
              <div className="text-lg font-semibold">
                {customer.realConsultCount || customer.voiceSummaries.length}
              </div>
              <div className="text-xs text-muted-foreground">상담 수</div>
            </div>
            <div className="bg-background rounded-lg p-3">
              <div className="text-lg font-semibold">
                {customer.realActionCount || customer.totalActivities}
              </div>
              <div className="text-xs text-muted-foreground">처리 완료</div>
            </div>
            <div className="bg-background rounded-lg p-3">
              <div className="text-lg font-semibold">
                {customer.realPendingCount || customer.pendingTasks}
              </div>
              <div className="text-xs text-muted-foreground">대기 작업</div>
            </div>
            <div className="bg-background rounded-lg p-3">
              <div className="text-lg font-semibold">{customer.completedTasks}</div>
              <div className="text-xs text-muted-foreground">완료 작업</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">빠른 작업</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              미팅 일정 잡기
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
              <FileText className="w-4 h-4 mr-2" />
              제안서 작성
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
              <TrendingUp className="w-4 h-4 mr-2" />
              진척 분석
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}