import React from 'react';
import { MicOff, Copy, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface RecordingSidebarProps {
  confidence: number;
  isRecording: boolean;
  hasTranscript: boolean;
  getFileSize: () => string;
  onNavigateToReview: () => void;
  onCopyTranscript: () => void;
  onDownloadTranscript: () => void;
}

export function RecordingSidebar({
  confidence,
  isRecording,
  hasTranscript,
  getFileSize,
  onNavigateToReview,
  onCopyTranscript,
  onDownloadTranscript
}: RecordingSidebarProps) {
  return (
    <>
      {/* File Information */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>파일 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">예상 파일 크기</span>
            <span className="text-sm font-medium">{getFileSize()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">파일 형식</span>
            <span className="text-sm font-medium">
              {MediaRecorder.isTypeSupported('audio/webm') ? 'WebM' : 'MP4'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">품질</span>
            <span className="text-sm font-medium">고품질 (44.1kHz)</span>
          </div>
          {confidence > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">음성 인식 신뢰도</span>
              <span className="text-sm font-medium">{Math.round(confidence * 100)}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-xl" disabled={true}>
              <MicOff className="w-4 h-4 mr-2" />
              마이크 음소거
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={onNavigateToReview}
              disabled={isRecording}
            >
              이전 기록 보기
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={onCopyTranscript}
              disabled={!hasTranscript}
            >
              <Copy className="w-4 h-4 mr-2" />
              텍스트 복사
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={onDownloadTranscript}
              disabled={!hasTranscript}
            >
              <Download className="w-4 h-4 mr-2" />
              텍스트 저장
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}