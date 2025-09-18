import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw, Edit, Clock, User, Brain, TrendingUp, AlertCircle, RefreshCw, CheckCircle, ChevronDown, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { consultAPI, apiUtils, codeAPI, SalesStageParent } from '../lib/api';
import type { Page } from '../types';

interface ReviewPageProps {
  onNavigate: (page: Page) => void;
  recordingData?: {
    recordedText: string;
    context: {
      type: 'task' | 'customer';
      name: string;
      id: string;
    } | null;
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
  context?: {
    type: 'task' | 'customer';
    name: string;
    id: string;
  } | null;
}

interface LLMAnalysisResult {
  summary: string;
  stages: Array<{
    id: number;
    name: string;
    confidence: number;
  }>;
}

export function ReviewPage({ onNavigate, recordingData, recordedText = '', context }: ReviewPageProps) {
  // 전달받은 데이터 처리
  const actualRecordedText = recordingData?.recordedText || recordedText;
  const actualContext = recordingData?.context || context;
  const recordingInfo = recordingData?.recordingInfo;

  // 기본 상태
  const [transcript, setTranscript] = useState(actualRecordedText);
  const [originalTranscript] = useState(actualRecordedText);
  
  // LLM 분석 관련 상태
  const [llmAnalysis, setLlmAnalysis] = useState<LLMAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // 수동 단계 선택 관련 상태
  const [allSalesStages, setAllSalesStages] = useState<SalesStageParent[]>([]);
  const [selectedManualStages, setSelectedManualStages] = useState<number[]>([]);
  const [removedAIStages, setRemovedAIStages] = useState<number[]>([]); // AI 분석에서 제거된 단계들
  const [isLoadingSalesStages, setIsLoadingSalesStages] = useState(false);
  const [salesStagesError, setSalesStagesError] = useState<string | null>(null);
  
  // 모달 상태
  const [showStageModal, setShowStageModal] = useState(false);

  // 상담 정보
  const consultationData = {
    customer: actualContext?.name || '고객명 미확인',
    date: new Date().toLocaleDateString('ko-KR'),
    time: new Date().toLocaleTimeString('ko-KR'),
    duration: recordingInfo?.duration || '00:00',
    fileSize: recordingInfo?.fileSize || '0 MB',
    format: 'WebM'
  };

  // STT 결과가 바뀌면 상태 업데이트
  useEffect(() => {
    setTranscript(actualRecordedText);
  }, [actualRecordedText]);

  // 컴포넌트 마운트 시 자동 분석 실행
  useEffect(() => {
    if (actualRecordedText && actualRecordedText.trim().length > 0 && !hasAnalyzed) {
      analyzeLLM(actualRecordedText);
    }
  }, [actualRecordedText, hasAnalyzed]);

  // 모달 열기/닫기 함수들
  const handleOpenStageModal = async () => {
    setShowStageModal(true);
    if (allSalesStages.length === 0) {
      await loadSalesStages();
    }
  };

  const handleCloseStageModal = () => {
    setShowStageModal(false);
  };

  const handleAddStages = () => {
    setShowStageModal(false);
  };

  // 영업 단계 로딩 함수
  const loadSalesStages = async () => {
    setIsLoadingSalesStages(true);
    setSalesStagesError(null);
    
    try {
      const stages = await codeAPI.getSalesMetadata();
      setAllSalesStages(stages);
    } catch (error) {
      const errorMessage = apiUtils.formatErrorMessage(error);
      setSalesStagesError(errorMessage);
      console.error('영업 단계 로딩 실패:', error);
    } finally {
      setIsLoadingSalesStages(false);
    }
  };

  // 수동 단계 선택/해제
  const handleToggleManualStage = (stageId: number) => {
    setSelectedManualStages(prev => 
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  // 부모 단계 선택/해제 (하위 모든 단계를 일괄 선택/해제)
  const handleToggleParentStage = (parent: SalesStageParent) => {
    const childIds = parent.child_list.map(child => child.id);
    const allChildrenSelected = childIds.every(id => 
      (llmAnalysis?.stages.some(stage => stage.id === id) && !removedAIStages.includes(id)) ||
      selectedManualStages.includes(id)
    );

    if (allChildrenSelected) {
      // 모든 자식이 선택되어 있으면 모두 해제
      childIds.forEach(id => {
        if (llmAnalysis?.stages.some(stage => stage.id === id)) {
          handleToggleAIStage(id); // AI 단계 제거
        } else {
          setSelectedManualStages(prev => prev.filter(selectedId => selectedId !== id));
        }
      });
    } else {
      // 일부만 선택되어 있거나 아무것도 선택되지 않았으면 모두 선택
      childIds.forEach(id => {
        const isAIStage = llmAnalysis?.stages.some(stage => stage.id === id);
        const isAIRemoved = removedAIStages.includes(id);
        const isManualSelected = selectedManualStages.includes(id);

        if (isAIStage && isAIRemoved) {
          handleToggleAIStage(id); // AI 단계 복원
        } else if (!isAIStage && !isManualSelected) {
          setSelectedManualStages(prev => [...prev, id]); // 수동 단계 추가
        }
      });
    }
  };

  // 부모 단계의 체크 상태 확인
  const getParentCheckState = (parent: SalesStageParent) => {
    const childIds = parent.child_list.map(child => child.id);
    const selectedChildren = childIds.filter(id =>
      (llmAnalysis?.stages.some(stage => stage.id === id) && !removedAIStages.includes(id)) ||
      selectedManualStages.includes(id)
    );

    if (selectedChildren.length === 0) {
      return 'unchecked';
    } else if (selectedChildren.length === childIds.length) {
      return 'checked';
    } else {
      return 'indeterminate';
    }
  };

  // AI 단계 제거/복원 함수
  const handleToggleAIStage = (stageId: number) => {
    setRemovedAIStages(prev => 
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId) // 복원
        : [...prev, stageId] // 제거
    );
  };

  // 선택된 수동 단계들을 이름으로 변환
  const getSelectedManualStageNames = () => {
    const selectedStages: Array<{id: number, name: string}> = [];
    
    allSalesStages.forEach(parent => {
      parent.child_list.forEach(child => {
        if (selectedManualStages.includes(child.id)) {
          selectedStages.push({
            id: child.id,
            name: child.name
          });
        }
      });
    });
    
    return selectedStages;
  };

  // LLM 분석 결과 + 수동 선택 결과 합치기 (제거된 AI 단계는 제외)
  const getCombinedStages = () => {
    const llmStages = (llmAnalysis?.stages || []).filter(stage => !removedAIStages.includes(stage.id));
    const manualStages = getSelectedManualStageNames();
    
    // ID 기준 중복 제거
    const combined = [...llmStages];
    
    manualStages.forEach(manual => {
      const exists = llmStages.some(llm => llm.id === manual.id);
      if (!exists) {
        combined.push({
          id: manual.id,
          name: manual.name,
          confidence: 1.0 // 수동 선택은 100% 신뢰도
        });
      }
    });
    
    return combined;
  };

  // LLM 분석 함수
  const analyzeLLM = async (text: string = transcript) => {
    if (!text.trim()) {
      setAnalysisError('분석할 텍스트가 없습니다.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setHasAnalyzed(true);

    try {
      const result = await apiUtils.withRetry(() => 
        consultAPI.analyzeConsultation(text.trim())
      );
      
      setLlmAnalysis(result);
      console.log('LLM 분석 완료:', result);
    } catch (error) {
      const errorMessage = apiUtils.formatErrorMessage(error);
      setAnalysisError(errorMessage);
      console.error('LLM 분석 실패:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 재분석 함수
  const handleReanalyze = () => {
    setHasAnalyzed(false);
    analyzeLLM();
  };

  // 저장 함수
  const handleSave = async () => {
    const combinedStages = getCombinedStages();
    
    console.log('저장 시도 - combinedStages:', combinedStages);
    console.log('저장 시도 - actualContext:', actualContext);
    
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
      
      console.log('분석 결과가 저장되었습니다.');
      alert('저장되었습니다!');
    } catch (error) {
      console.error('분석 결과 저장 실패:', error);
      alert('저장 실패: ' + error);
    }
  };

  // 텍스트 되돌리기
  const handleRevert = () => {
    setTranscript(originalTranscript);
  };

  // 유틸리티 함수들
  const getKoreanStageName = (stageName: string) => {
    const stageMap: { [key: string]: string } = {
      '초기상담': '초기상담',
      '조건설명': '조건설명',
      '제안서제출': '제안서제출',
      '계약체결': '계약체결',
      'lead': '리드',
      'prospect': '잠재고객',
      'opportunity': '기회',
      'customer': '고객'
    };
    return stageMap[stageName] || stageName;
  };

  const getStageColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.7) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getSentimentFromStages = () => {
    if (!llmAnalysis?.stages || llmAnalysis.stages.length === 0) return 'neutral';
    const avgConfidence = llmAnalysis.stages.reduce((sum, stage) => sum + stage.confidence, 0) / llmAnalysis.stages.length;
    if (avgConfidence >= 0.8) return 'positive';
    if (avgConfidence >= 0.6) return 'neutral';
    return 'negative';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'neutral': return 'text-yellow-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const extractKeywords = (text: string) => {
    const keywords = ['보험', '상담', '계약', '상품', '설명', '검토', '제안'];
    return keywords.filter(keyword => text.includes(keyword));
  };

  // 저장 버튼 활성화 조건
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
            {/* Left Column - Metadata & AI Analysis */}
            <div className="lg:col-span-1 space-y-4">
              {/* 상담 정보 */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-4 h-4" />
                    상담 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
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
                        <div className="text-xs text-muted-foreground mt-1">
                          <div>단어 수: {recordingInfo.wordCount}</div>
                          <div>신뢰도: {Math.round(recordingInfo.confidence * 100)}%</div>
                          <div>녹음 시간(초): {recordingInfo.recordingTimeSeconds}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI 분석 결과 */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="w-4 h-4" />
                    AI 분석
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAnalyzing ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">분석 중...</p>
                    </div>
                  ) : llmAnalysis ? (
                    <>
                      {/* 분석 요약 */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block">분석 요약</label>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm leading-relaxed">{llmAnalysis.summary}</p>
                        </div>
                      </div>

                      {/* AI 분석된 영업 단계 */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block">AI 분석된 상담 단계</label>
                        <div className="space-y-2">
                          {(llmAnalysis.stages || []).map((stage, index) => {
                            const isRemoved = removedAIStages.includes(stage.id);
                            return (
                              <div key={stage.id || index} className="flex items-center justify-between">
                                <Badge 
                                  variant="outline" 
                                  className={`rounded-full text-xs ${
                                    isRemoved 
                                      ? 'bg-gray-100 text-gray-500 border-gray-300 line-through' 
                                      : getStageColor(stage.confidence)
                                  }`}
                                >
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  {getKoreanStageName(stage.name)}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(stage.confidence * 100)}%
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleToggleAIStage(stage.id)}
                                    title={isRemoved ? "AI 단계 복원" : "AI 단계 제거"}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* 추가 단계 선택 버튼 */}
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full rounded-lg flex items-center justify-center gap-2"
                            onClick={handleOpenStageModal}
                          >
                            <Plus className="w-3 h-3" />
                            <span className="text-xs">추가 단계 선택</span>
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                    
                      {/* 최종 선택된 단계들 표시 - 수동 단계가 있을 때만 */}
                      {selectedManualStages.length > 0 && (
                        <div className="border-t pt-4">
                          <label className="text-xs text-muted-foreground mb-2 block">
                            최종 선택된 단계 ({getCombinedStages().length}개)
                          </label>
                          <div className="space-y-2">
                            {getCombinedStages().map((stage, index) => (
                              <div key={`combined-${stage.id}-${index}`} className="flex items-center justify-between">
                                <Badge 
                                  variant={stage.confidence === 1.0 ? "secondary" : "outline"} 
                                  className={`rounded-full text-xs ${
                                    stage.confidence === 1.0 
                                      ? 'bg-purple-100 text-purple-800 border-purple-200' 
                                      : getStageColor(stage.confidence)
                                  }`}
                                >
                                  {stage.confidence === 1.0 ? (
                                    <User className="w-3 h-3 mr-1" />
                                  ) : (
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                  )}
                                  {getKoreanStageName(stage.name)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {stage.confidence === 1.0 ? '수동' : `${Math.round(stage.confidence * 100)}%`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 감정 분석 */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block">감정 분석</label>
                        <div className={`text-sm font-medium ${getSentimentColor(getSentimentFromStages())}`}>
                          {getSentimentFromStages().charAt(0).toUpperCase() + getSentimentFromStages().slice(1)}
                        </div>
                      </div>

                      {/* 핵심 키워드 */}
                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block">핵심 키워드</label>
                        <div className="flex flex-wrap gap-1">
                          {extractKeywords(transcript).slice(0, 4).map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="rounded-full text-xs px-2 py-1">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">AI 분석 대기 중</p>
                      <p className="text-xs mt-1">텍스트가 있으면 자동으로 분석됩니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Center Column - Editable Transcript */}
            <div className="lg:col-span-2 flex flex-col">
              <Card className="rounded-2xl shadow-sm flex-1 flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      전사 내용 편집
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl"
                        onClick={handleReanalyze}
                        disabled={isAnalyzing || !transcript.trim()}
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        AI 재분석
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl"
                        onClick={handleRevert}
                        disabled={transcript === originalTranscript}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        되돌리기
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <div className="flex-1 min-h-0">
                    <Textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="h-full w-full rounded-none border-0 resize-none p-4 leading-relaxed focus:ring-0 focus:border-0"
                      placeholder="전사 내용이 여기에 표시됩니다. 내용을 수정하고 AI 재분석 버튼을 클릭하세요."
                    />
                  </div>
                  <div className="flex-shrink-0 p-4 border-t bg-muted/20">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {transcript.trim().split(/\s+/).filter(word => word.length > 0).length} 단어
                      </span>
                      <span>
                        {transcript.length} 글자
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 단계 선택 모달 */}
      <Dialog open={showStageModal} onOpenChange={setShowStageModal}>
        <DialogContent className="max-w-lg h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              추가 단계 선택
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-1" style={{ maxHeight: 'calc(80vh - 120px)' }}>
            {isLoadingSalesStages ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">단계 목록 로딩 중...</p>
              </div>
            ) : salesStagesError ? (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  단계 목록 로딩 실패: {salesStagesError}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4 py-4">
                {allSalesStages.map(parent => {
                  const checkState = getParentCheckState(parent);
                  
                  return (
                    <div key={parent.id} className="space-y-2">
                      {/* 부모 단계 체크박스 */}
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`parent-${parent.id}`}
                          checked={checkState === 'checked' || checkState === 'indeterminate'}
                          // @ts-ignore - indeterminate는 HTML 속성이지만 타입 정의에 없을 수 있음
                          ref={(el) => {
                            if (el) el.indeterminate = checkState === 'indeterminate';
                          }}
                          onCheckedChange={() => handleToggleParentStage(parent)}
                          className="w-4 h-4"
                        />
                        <Label 
                          htmlFor={`parent-${parent.id}`}
                          className="text-sm font-medium text-foreground cursor-pointer"
                        >
                          {parent.name}
                          {checkState === 'indeterminate' && (
                            <span className="text-xs text-orange-600 ml-2">(일부 선택)</span>
                          )}
                          {checkState === 'checked' && (
                            <span className="text-xs text-green-600 ml-2">(전체 선택)</span>
                          )}
                        </Label>
                      </div>
                      
                      {/* 자식 단계들 */}
                      <div className="span-3 ml-4 pl-6 border-l-2 border-gray-200">
                      {parent.child_list.map(child => {
                        const isAISelected = llmAnalysis?.stages.some(stage => stage.id === child.id);
                        const isAIRemoved = removedAIStages.includes(child.id);
                        const isManualSelected = selectedManualStages.includes(child.id);
                        
                        return (
                          <div key={child.id} className="flex items-center gap-3 ">
                            <span></span>
                            <Checkbox
                              id={`modal-stage-${child.id}`}
                              checked={
                                (isAISelected && !isAIRemoved) || 
                                isManualSelected
                              }
                              onCheckedChange={() => {
                                if (isAISelected) {
                                  handleToggleAIStage(child.id);
                                } else {
                                  handleToggleManualStage(child.id);
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <Label 
                              htmlFor={`modal-stage-${child.id}`} 
                              className="text-sm cursor-pointer flex-1"
                            >
                              {child.name}
                              {isAISelected && !isAIRemoved && (
                                <span className="text-xs text-blue-600 ml-2">(AI 선택됨)</span>
                              )}
                              {isAISelected && isAIRemoved && (
                                <span className="text-xs text-red-600 ml-2">(AI 제거됨)</span>
                              )}
                              {!isAISelected && isManualSelected && (
                                <span className="text-xs text-purple-600 ml-2">(수동 선택)</span>
                              )}
                            </Label>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCloseStageModal}>
              취소
            </Button>
            <Button onClick={handleAddStages}>
              선택 완료 ({selectedManualStages.length}개)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}