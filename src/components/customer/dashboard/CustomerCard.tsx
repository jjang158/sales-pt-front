// components/customer/dashboard/CustomerCard.tsx
import React from 'react';
import { ArrowRight, Mic, Edit, FileText, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Separator } from '../../ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { RecordingContext,Customer } from '../../../types/index';
import { getStageColor, getStageName, getSentimentColor, createCustomerProjects } from '../../../utils/customerUtils';

interface CustomerCardProps {
  customer: Customer;
  onSelect: (id: string) => void;
  onStartRecording?: (context: RecordingContext) => void;
}

export function CustomerCard({ customer, onSelect, onStartRecording }: CustomerCardProps) {
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
            <div className="text-lg font-semibold">{customer.voiceSummaries?.length || 0}</div>
            <div className="text-xs text-muted-foreground">음성 요약</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{customer.totalActivities || 0}</div>
            <div className="text-xs text-muted-foreground">총 활동</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{customer.pendingTasks || 0}</div>
            <div className="text-xs text-muted-foreground">대기 작업</div>
          </div>
        </div>

        <Separator />

        {customer.voiceSummaries && customer.voiceSummaries.length > 0 && (
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
                <span className="text-xs text-muted-foreground">{customer.voiceSummaries[0].meetingType}</span>
                <span className="text-xs text-muted-foreground">{customer.voiceSummaries[0].date}</span>
              </div>
              <p className="text-sm line-clamp-2">{customer.voiceSummaries[0].summary}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onSelect(customer.id);
            }}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            관리
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onStartRecording?.({ type: 'customer', name: customer.name, id: customer.id });
                }}
              >
                <Mic className="w-4 h-4 mr-2" />
                녹음
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  console.log('사진 촬영:', customer.name);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                사진
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  console.log('텍스트 입력:', customer.name);
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                텍스트
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}