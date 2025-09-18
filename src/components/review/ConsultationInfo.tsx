import React from 'react';
import { Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ConsultationInfoProps {
  consultationData: {
    customer: string;
    date: string;
    time: string;
    duration: string;
    fileSize: string;
  };
  recordingInfo?: {
    wordCount: number;
    confidence: number;
    recordingTimeSeconds: number;
  };
}

export function ConsultationInfo({ consultationData, recordingInfo }: ConsultationInfoProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="w-4 h-4" />
          상담 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">고객명</label>
          <div className="flex items-center gap-2 mt-1">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm font-medium">{consultationData.customer}</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">일시</label>
          <p className="text-sm font-medium mt-1">{consultationData.date}</p>
          <p className="text-xs text-muted-foreground">{consultationData.time}</p>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="text-xs text-muted-foreground">시간</label>
            <p className="text-sm font-medium mt-1">{consultationData.duration}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">파일</label>
            <p className="text-sm font-medium mt-1">{consultationData.fileSize}</p>
          </div>
        </div>
        {recordingInfo && (
          <div className="pt-2 border-t">
            <label className="text-xs text-muted-foreground">추가 정보</label>
            <div className="text-xs text-muted-foreground mt-1 space-y-1">
              <div>단어 수: {recordingInfo.wordCount}</div>
              <div>신뢰도: {Math.round(recordingInfo.confidence * 100)}%</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}