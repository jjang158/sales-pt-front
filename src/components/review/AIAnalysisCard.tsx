import React from 'react';
import { Brain, TrendingUp, User, Plus, ChevronDown, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface AIAnalysisCardProps {
  isAnalyzing: boolean;
  llmAnalysis: any;
  removedAIStages: number[];
  selectedManualStages: number[];
  getCombinedStages: () => any[];
  transcript: string;
  onToggleAIStage: (stageId: number) => void;
  onOpenStageModal: () => void;
}

export function AIAnalysisCard({
  isAnalyzing,
  llmAnalysis,
  removedAIStages,
  selectedManualStages,
  getCombinedStages,
  transcript,
  onToggleAIStage,
  onOpenStageModal
}: AIAnalysisCardProps) {
  const getStageColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.7) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const extractKeywords = (text: string) => {
    const keywords = ['보험', '상담', '계약', '상품', '설명', '검토', '제안'];
    return keywords.filter(keyword => text.includes(keyword));
  };

  return (
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
              <label className="text-xs text-muted-foreground mb-2 block">분석된 상담 단계</label>
              <div className="space-y-2">
                {llmAnalysis.stages?.map((stage: any, index: number) => {
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
                        {stage.name}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {Math.round(stage.confidence * 100)}%
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onToggleAIStage(stage.id)}
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
                  onClick={onOpenStageModal}
                >
                  <Plus className="w-3 h-3" />
                  <span className="text-xs">추가 단계 선택</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* 최종 선택된 단계들 */}
            {selectedManualStages.length > 0 && (
              <div className="border-t pt-4">
                <label className="text-xs text-muted-foreground mb-2 block">
                  최종 선택된 단계 ({getCombinedStages().length}개)
                </label>
                <div className="space-y-2">
                  {getCombinedStages().map((stage: any, index: number) => (
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
                        {stage.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {stage.confidence === 1.0 ? '수동' : `${Math.round(stage.confidence * 100)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
          </div>
        )}
      </CardContent>
    </Card>
  );
}