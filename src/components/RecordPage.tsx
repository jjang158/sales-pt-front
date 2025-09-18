import React, { useEffect, useRef } from 'react';
import { Mic, Square, Pause, Play, MicOff, Volume2, ArrowLeft, AlertCircle, Copy, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { Page } from '../types';

interface RecordPageProps {
  onNavigate: (page: Page, data?: any) => void;
  context?: {
    type: 'task' | 'customer';
    name: string;
    id: string;
  } | null;
}

export function RecordPage({ onNavigate, context }: RecordPageProps) {
  // 현재 값들을 실시간으로 추적하는 ref
  const recordingDataRef = useRef({
    recordingTime: 0,
    wordCount: 0,
    confidence: 0,
    transcript: ''
  });

  // Speech recognition hook
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported: isSpeechSupported,
    confidence,
    error: sttError,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
    hasTranscript,
    wordCount,
    getFormattedTranscript
  } = useSpeechRecognition({
    lang: 'ko-KR',
    continuous: true,
    interimResults: true,
    onTranscriptUpdate: (transcript, isFinal) => {
      if (isFinal) {
        console.log('Final transcript:', transcript);
        // ref 업데이트
        recordingDataRef.current.transcript = getFormattedTranscript();
        recordingDataRef.current.wordCount = wordCount;
        recordingDataRef.current.confidence = confidence;
      }
    },
    onError: (error) => {
      console.error('STT Error:', error);
    }
  });

  // Audio recording hook
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioLevel,
    audioBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    formatTime,
    getFileSize,
    isSupported: isRecordingSupported
  } = useAudioRecording({
    onRecordingComplete: (blob) => {
      console.log('Recording completed:', blob);
      console.log('Current ref data:', recordingDataRef.current);
      
      // ref에서 최신 데이터 가져오기
      const currentData = recordingDataRef.current;
      
      const recordingData = {
        recordedText: currentData.transcript || getFormattedTranscript(),
        context: context,
        audioBlob: blob,
        recordingInfo: {
          duration: formatTime(currentData.recordingTime),
          fileSize: blob ? 
            `${(blob.size / (1024 * 1024)).toFixed(1)} MB` : 
            'Unknown',
          wordCount: currentData.wordCount,
          confidence: currentData.confidence,
          recordingTimeSeconds: currentData.recordingTime
        }
      };
      
      console.log('Final recording data to send:', recordingData);
      
      setTimeout(() => {
        onNavigate('review', recordingData);
      }, 500);
    },
    onError: (errorMessage) => {
      console.error('Recording error:', errorMessage);
    }
  });

  // 상태 변경시 ref 업데이트
  useEffect(() => {
    recordingDataRef.current.recordingTime = recordingTime;
  }, [recordingTime]);

  useEffect(() => {
    recordingDataRef.current.wordCount = wordCount;
    recordingDataRef.current.confidence = confidence;
    recordingDataRef.current.transcript = getFormattedTranscript();
  }, [wordCount, confidence, getFormattedTranscript]);

  // Sync speech recognition with recording state
  useEffect(() => {
    if (isRecording && !isPaused) {
      if (isSpeechSupported && !isListening) {
        startListening();
      }
    } else {
      if (isListening) {
        stopListening();
      }
    }
  }, [isRecording, isPaused, isSpeechSupported, isListening, startListening, stopListening]);

  const handleStart = async () => {
    try {
      resetTranscript();
      clearError();
      // ref 초기화
      recordingDataRef.current = {
        recordingTime: 0,
        wordCount: 0,
        confidence: 0,
        transcript: ''
      };
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handlePause = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const handleStop = async () => {
    console.log('=== BEFORE STOP ===');
    console.log('recordingTime:', recordingTime);
    console.log('wordCount:', wordCount);
    console.log('confidence:', confidence);
    console.log('audioBlob:', audioBlob);
    console.log('getFormattedTranscript():', getFormattedTranscript());
    
    // 마지막으로 ref 업데이트
    recordingDataRef.current = {
      recordingTime: recordingTime,
      wordCount: wordCount,
      confidence: confidence,
      transcript: getFormattedTranscript()
    };
    
    console.log('Stopping with ref data:', recordingDataRef.current);
    
    stopRecording(); // 이것이 onRecordingComplete를 트리거함
    stopListening();
    
    // 디버깅용 - 여러 시점에서 데이터 확인
    setTimeout(() => {
      console.log('=== AFTER 500ms ===');
      console.log('recordingTime:', recordingTime);
      console.log('audioBlob:', audioBlob);
    }, 500);
    
    setTimeout(() => {
      console.log('=== AFTER 1000ms ===');
      console.log('recordingTime:', recordingTime);
      console.log('audioBlob:', audioBlob);
    }, 1000);
  };

  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(getFormattedTranscript());
      console.log('Transcript copied to clipboard');
    } catch (error) {
      console.error('Failed to copy transcript:', error);
    }
  };

  const handleDownloadTranscript = () => {
    const content = getFormattedTranscript();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRecordingStatus = () => {
    if (!isRecording) return 'idle';
    if (isPaused) return 'paused';
    return 'recording';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': return 'bg-red-100 text-red-800 border-red-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'idle': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Check overall support
  if (!isRecordingSupported) {
    return (
      <div className="h-full flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            죄송합니다. 현재 브라우저에서는 오디오 녹음 기능을 지원하지 않습니다. 
            Chrome, Firefox, Safari 등의 최신 브라우저를 사용해 주세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('dashboard')}
              className="rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                상담 녹음 - {context ? `${context.type === 'task' ? '업무' : '고객'}: ${context.name}` : '고객/업무 플레이스홀더'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {context 
                  ? `${context.type === 'task' ? '업무 세션' : '상담'} 녹음 및 실시간 전사`
                  : '음성 녹음 및 실시간 전사'
                }
              </p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            {/* STT Status */}
            {isSpeechSupported && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                }`}></div>
                <span className="text-xs text-muted-foreground">
                  STT {isListening ? '활성' : '비활성'}
                </span>
              </div>
            )}
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">현재 시간</p>
              <p className="text-sm font-medium">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alerts */}
      <div className="p-4 space-y-2">
        {recordingError && (
          <Alert variant="destructive" className="max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              녹음 오류: {recordingError}
            </AlertDescription>
          </Alert>
        )}
        
        {sttError && (
          <Alert variant="destructive" className="max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              음성 인식 오류: {sttError}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearError}
                className="ml-2 h-6"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {!isSpeechSupported && (
          <Alert className="max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              음성 인식 기능이 지원되지 않습니다. 녹음은 가능하지만 실시간 전사는 사용할 수 없습니다.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left Section - Recording Controls */}
            <div className="space-y-6">
              {/* Recording Status */}
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
                        onClick={handleStart}
                        size="lg"
                        className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Mic className="w-6 h-6" />
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={handlePause}
                          size="lg"
                          variant="outline"
                          className="rounded-full w-14 h-14"
                        >
                          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        </Button>
                        <Button 
                          onClick={handleStop}
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
                      onClick={() => onNavigate('review')}
                      disabled={isRecording}
                    >
                      이전 기록 보기
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-xl"
                      onClick={handleCopyTranscript}
                      disabled={!hasTranscript}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      텍스트 복사
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-xl"
                      onClick={handleDownloadTranscript}
                      disabled={!hasTranscript}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      텍스트 저장
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Section - Real-time STT Transcription */}
            <div className="space-y-6">
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
                          
                          {/* Recording status indicator when no transcript yet */}
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
                          onClick={resetTranscript}
                          disabled={isRecording}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          초기화
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleCopyTranscript}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          복사
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="border-t bg-muted/30 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>녹음 시간: {formatTime(recordingTime)}</span>
            {hasTranscript && <span>전사 텍스트: {wordCount} 단어</span>}
            <span>파일 크기: {getFileSize()}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {isSpeechSupported && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isListening ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span>음성 인식 {isListening ? '활성' : '비활성'}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isRecording ? (isPaused ? 'bg-yellow-500' : 'bg-red-500') : 'bg-gray-400'
              }`}></div>
              <span>녹음 {getRecordingStatus()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}