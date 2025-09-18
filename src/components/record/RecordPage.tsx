import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Mic, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { useAudioRecording } from '../../hooks/useAudioRecording';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { RecordingControls } from './RecordingControls';
import { TranscriptDisplay } from './TranscriptDisplay';
import { RecordingSidebar } from './RecordingSidebar';
import type { Page } from '../../types';

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
      const currentData = recordingDataRef.current;
      
      const recordingData = {
        recordedText: currentData.transcript || getFormattedTranscript(),
        context: context,
        audioBlob: blob,
        recordingInfo: {
          duration: formatTime(currentData.recordingTime),
          fileSize: blob ? `${(blob.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown',
          wordCount: currentData.wordCount,
          confidence: currentData.confidence,
          recordingTimeSeconds: currentData.recordingTime
        }
      };
      
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

  // Event handlers
  const handleStart = async () => {
    try {
      resetTranscript();
      clearError();
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
    recordingDataRef.current = {
      recordingTime: recordingTime,
      wordCount: wordCount,
      confidence: confidence,
      transcript: getFormattedTranscript()
    };
    
    stopRecording();
    stopListening();
  };

  const handleCopyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(getFormattedTranscript());
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
            <AlertDescription>녹음 오류: {recordingError}</AlertDescription>
          </Alert>
        )}
        
        {sttError && (
          <Alert variant="destructive" className="max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              음성 인식 오류: {sttError}
              <Button variant="ghost" size="sm" onClick={clearError} className="ml-2 h-6">
                재시도
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
              <RecordingControls
                isRecording={isRecording}
                isPaused={isPaused}
                recordingTime={recordingTime}
                audioLevel={audioLevel}
                formatTime={formatTime}
                getRecordingStatus={getRecordingStatus}
                onStart={handleStart}
                onPause={handlePause}
                onStop={handleStop}
              />

              <RecordingSidebar
                confidence={confidence}
                isRecording={isRecording}
                hasTranscript={hasTranscript}
                getFileSize={getFileSize}
                onNavigateToReview={() => onNavigate('review')}
                onCopyTranscript={handleCopyTranscript}
                onDownloadTranscript={handleDownloadTranscript}
              />
            </div>

            {/* Right Section - Transcript */}
            <div className="space-y-6">
              <TranscriptDisplay
                transcript={transcript}
                interimTranscript={interimTranscript}
                finalTranscript={finalTranscript}
                hasTranscript={hasTranscript}
                wordCount={wordCount}
                confidence={confidence}
                isRecording={isRecording}
                isPaused={isPaused}
                isListening={isListening}
                isSpeechSupported={isSpeechSupported}
                getFormattedTranscript={getFormattedTranscript}
                onResetTranscript={resetTranscript}
                onCopyTranscript={handleCopyTranscript}
              />
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