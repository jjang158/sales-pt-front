import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw, RefreshCw, Brain, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { ConsultationInfo } from './ConsultationInfo';
import { AIAnalysisCard } from './AIAnalysisCard';
import { TranscriptEditor } from './TranscriptEditor';
import { StageSelectionModal } from './StageSelectionModal';
import { consultAPI } from '../../lib/api';
import { useReviewData } from './useReviewHooks';
import type { Page } from '../../types';

interface ReviewPageProps {
  onNavigate: (page: Page) => void;
  recordingData?: {
    recordedText: string;
    context: { type: 'task' | 'customer'; name: string; id: string; } | null;
    audioBlob: Blob;
    recordingInfo: {
      duration: string;
      fileSize: string;
      wordCount: number;
      confidence: number;
      recordingTimeSeconds: number;
    };
  };
  recordedText?: string;
  context?: { type: 'task' | 'customer'; name: string; id: string; } | null;
}

export function ReviewPage({ onNavigate, recordingData, recordedText = '', context }: ReviewPageProps) {
  // 전달받은 데이터 처리
  const actualRecordedText = recordingData?.recordedText || recordedText;
  const actualContext = recordingData?.context || context;
  const recordingInfo = recordingData?.recordingInfo;

  // 기본 상태
  const [transcript, setTranscript] = useState(actualRecordedText);
  const [originalTranscript] = useState(actualRecordedText);

  // 커스텀 훅 사용
  const {
    // 분석 관련
    llmAnalysis,
    isAnalyzing,
    analysisError,
    hasAnalyzed,
    analyzeLLM,
    setHasAnalyzed,
    
    // 단계 선택 관련
    allSalesStages,
    selectedManualStages,
    removedAIStages,
    showStageModal,
    isLoadingSalesStages,
    salesStagesError,
    setShowStageModal,
    loadSalesStages,
    handleToggleManualStage,
    handleToggleParentStage,
    handleToggleAIStage,
    getParentCheckState,
    getCombinedStages
  } = useReviewData(null);

  // 상담 정보
  const consultationData = {
    customer: actualContext?.name || '고객명 미확인',
    date: new Date().toLocaleDateString('ko-KR'),
    time: new Date().toLocaleTimeString('ko-KR'),
    duration: recordingInfo?.duration || '00:00',
    fileSize: recordingInfo?.fileSize || '0 MB',
    format: 'WebM'
  };

  // Effects
  useEffect(() => {
    setTranscript(actualRecordedText);
  }, [actualRecordedText]);

  //컴포넌트 생성 시 자동 분석(AI  분석) 실행
  useEffect(() => {
    if (actualRecordedText && actualRecordedText.trim().length > 0 && !hasAnalyzed) {
      analyzeLLM(actualRecordedText);
    }
  }, [actualRecordedText, hasAnalyzed, analyzeLLM]);

  // 이벤트 핸들러
  const handleReanalyze = () => {
    setHasAnalyzed(false);
    analyzeLLM(transcript);
  };

  const handleSave = async () => {
    const combinedStages = getCombinedStages();
    
    if (combinedStages.length === 0 || !actualContext) {
      console.warn('저장할 분석 결과나 컨텍스트가 없습니다.');
      return;
    }

    try {
      await consultAPI.saveConsultation(
        parseInt(actualContext.id),
        transcript,
        'voice',
        combinedStages.map(stage => ({
          stage_meta_id: stage.id,
          stage_name: stage.name
        }))
      );
      
      alert('저장되었습니다!');
    } catch (error) {
      console.error('분석 결과 저장 실패:', error);
      alert('저장 실패: ' + error);
    }
  };

  const handleRevert = () => {
    setTranscript(originalTranscript);
  };

  const canSave = Boolean((llmAnalysis || selectedManualStages.length > 0) && actualContext);

  return (
    <div className="h-full overflow-auto scrollbar-styled bg-gray-50/50 flex flex-col">
      {/* Page Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('record')}
              className="rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">녹음 검토 분석</h1>
              <p className="text-sm text-muted-foreground">전사 내용 편집 및 AI 인사이트 검토</p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg"
              onClick={() => onNavigate('record')}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              다시 녹음
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg"
              onClick={handleReanalyze}
              disabled={isAnalyzing || !transcript.trim()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              재분석
            </Button>
            <Button 
              size="sm" 
              className="rounded-lg"
              onClick={handleSave}
              disabled={!canSave}
            >
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </div>
        </div>
      </div>

      {/* Error/Status Alerts */}
      <div className="p-4 space-y-2">
        {isAnalyzing && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              AI가 상담 내용을 분석하고 있습니다...
              <Progress value={65} className="h-2 mt-2" />
            </AlertDescription>
          </Alert>
        )}

        {analysisError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              분석 중 오류가 발생했습니다: {analysisError}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReanalyze}
                className="ml-2 h-6"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                재시도
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {llmAnalysis && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              AI 분석이 완료되었습니다. 아래에서 결과를 확인하세요.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-4">
              <ConsultationInfo 
                consultationData={consultationData}
                recordingInfo={recordingInfo}
              />
              
              <AIAnalysisCard
                isAnalyzing={isAnalyzing}
                llmAnalysis={llmAnalysis}
                removedAIStages={removedAIStages}
                selectedManualStages={selectedManualStages}
                getCombinedStages={getCombinedStages}
                transcript={transcript}
                onToggleAIStage={handleToggleAIStage}
                onOpenStageModal={() => setShowStageModal(true)}
              />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 flex flex-col">
              <TranscriptEditor
                transcript={transcript}
                originalTranscript={originalTranscript}
                isAnalyzing={isAnalyzing}
                onTranscriptChange={setTranscript}
                onReanalyze={handleReanalyze}
                onRevert={handleRevert}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stage Selection Modal */}
      <StageSelectionModal
        open={showStageModal}
        onOpenChange={setShowStageModal}
        allSalesStages={allSalesStages}
        selectedManualStages={selectedManualStages}
        removedAIStages={removedAIStages}
        llmAnalysis={llmAnalysis}
        isLoadingSalesStages={isLoadingSalesStages}
        salesStagesError={salesStagesError}
        onLoadSalesStages={loadSalesStages}
        onToggleManualStage={handleToggleManualStage}
        onToggleParentStage={handleToggleParentStage}
        onToggleAIStage={handleToggleAIStage}
        getParentCheckState={getParentCheckState}
      />
    </div>
  );
}
