import React from 'react';
import { Mic, Square, Pause, Play, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioLevel: number;
  formatTime: (seconds: number) => string;
  getRecordingStatus: () => string;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

export function RecordingControls({
  isRecording,
  isPaused,
  recordingTime,
  audioLevel,
  formatTime,
  getRecordingStatus,
  onStart,
  onPause,
  onStop
}: RecordingControlsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': return 'bg-red-100 text-red-800 border-red-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'idle': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>녹음 상태</CardTitle>
          <Badge variant="outline" className={`rounded-full ${getStatusColor(getRecordingStatus())}`}>
            {getRecordingStatus().charAt(0).toUpperCase() + getRecordingStatus().slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer */}
        <div className="text-center">
          <div className="text-4xl font-mono font-semibold mb-2">{formatTime(recordingTime)}</div>
          <p className="text-muted-foreground">녹음 시간</p>
        </div>

        {/* Audio Level Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">오디오 레벨</span>
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <Progress value={audioLevel} className="h-2" />
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <Button 
              onClick={onStart}
              size="lg"
              className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 text-white"
            >
              <Mic className="w-6 h-6" />
            </Button>
          ) : (
            <>
              <Button 
                onClick={onPause}
                size="lg"
                variant="outline"
                className="rounded-full w-14 h-14"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button 
                onClick={onStop}
                size="lg"
                variant="destructive"
                className="rounded-full w-16 h-16"
              >
                <Square className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {!isRecording && "마이크를 클릭하여 녹음을 시작하세요"}
          {isRecording && !isPaused && "녹음 진행 중..."}
          {isRecording && isPaused && "녹음 일시정지"}
        </div>
      </CardContent>
    </Card>
  );
}