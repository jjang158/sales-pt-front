import React from 'react';
import { Mic, RefreshCw, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';

interface TranscriptDisplayProps {
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  hasTranscript: boolean;
  wordCount: number;
  confidence: number;
  isRecording: boolean;
  isPaused: boolean;
  isListening: boolean;
  isSpeechSupported: boolean;
  getFormattedTranscript: () => string;
  onResetTranscript: () => void;
  onCopyTranscript: () => void;
}

export function TranscriptDisplay({
  transcript,
  interimTranscript,
  finalTranscript,
  hasTranscript,
  wordCount,
  confidence,
  isRecording,
  isPaused,
  isListening,
  isSpeechSupported,
  getFormattedTranscript,
  onResetTranscript,
  onCopyTranscript
}: TranscriptDisplayProps) {
  return (
    <Card className="rounded-2xl shadow-sm h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>실시간 음성 전사</CardTitle>
            <p className="text-sm text-muted-foreground">
              {isSpeechSupported 
                ? "말하는 내용이 실시간으로 텍스트로 변환됩니다"
                : "음성 인식이 지원되지 않는 브라우저입니다"
              }
            </p>
          </div>
          {hasTranscript && (
            <Badge variant="secondary" className="rounded-full">
              {wordCount} 단어
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-full pb-6">
        <ScrollArea className="h-full rounded-xl bg-muted/30 p-4">
          {hasTranscript ? (
            <div className="space-y-4">
              {/* Session info */}
              <div className="text-xs text-muted-foreground border-b pb-2">
                [전사 시작 시간: {new Date().toLocaleTimeString()}]
                {confidence > 0 && ` • 신뢰도: ${Math.round(confidence * 100)}%`}
              </div>
              
              {/* Final transcript */}
              {finalTranscript && (
                <div className="space-y-2">
                  <p className="leading-relaxed text-sm whitespace-pre-wrap">
                    {getFormattedTranscript()}
                  </p>
                  {finalTranscript && interimTranscript && <Separator />}
                </div>
              )}
              
              {/* Interim transcript */}
              {interimTranscript && (
                <div className="space-y-2">
                  <p className="leading-relaxed text-sm text-muted-foreground italic whitespace-pre-wrap">
                    {interimTranscript}
                  </p>
                </div>
              )}

              {/* Live indicator */}
              {isRecording && !isPaused && isListening && (
                <div className="flex items-center gap-2 mt-4 pt-2 border-t">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">실시간 음성 인식 중...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Mic className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium">실시간 음성 전사</p>
                <p className="text-sm mt-2">
                  {isSpeechSupported
                    ? (isRecording 
                       ? "음성을 감지하고 있습니다..."
                       : "녹음을 시작하면 실시간으로 음성이 텍스트로 변환됩니다")
                    : "현재 브라우저에서는 음성 인식을 지원하지 않습니다"}
                </p>
                <p className="text-xs mt-1 opacity-75">
                  {isSpeechSupported ? "AI 음성 인식 기술 지원" : "Chrome 브라우저 권장"}
                </p>
                
                {/* Recording status indicators */}
                {isRecording && !isPaused && isListening && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">음성 대기 중...</span>
                  </div>
                )}
                
                {isRecording && isPaused && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">음성 인식 일시정지</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
        
        {/* Transcript actions */}
        {hasTranscript && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              마지막 업데이트: {new Date().toLocaleTimeString()}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onResetTranscript}
                disabled={isRecording}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                초기화
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onCopyTranscript}
              >
                <Copy className="w-3 h-3 mr-1" />
                복사
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}