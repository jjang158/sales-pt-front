import { useState } from 'react';
import { consultAPI, apiUtils, codeAPI, SalesStageParent } from '../../lib/api';

interface LLMAnalysisResult {
  summary: string;
  stages: Array<{ id: number; name: string; confidence: number; }>;
}

export function useReviewData(llmAnalysis: LLMAnalysisResult | null) {
  // 분석 관련 상태
  const [analysis, setAnalysis] = useState<LLMAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // 단계 선택 관련 상태
  const [allSalesStages, setAllSalesStages] = useState<SalesStageParent[]>([]);
  const [selectedManualStages, setSelectedManualStages] = useState<number[]>([]);
  const [removedAIStages, setRemovedAIStages] = useState<number[]>([]);
  const [showStageModal, setShowStageModal] = useState(false);
  const [isLoadingSalesStages, setIsLoadingSalesStages] = useState(false);
  const [salesStagesError, setSalesStagesError] = useState<string | null>(null);

  // 분석 함수
  const analyzeLLM = async (text: string) => {
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
      setAnalysis(result);
    } catch (error) {
      const errorMessage = apiUtils.formatErrorMessage(error);
      setAnalysisError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 영업 단계 로딩
  const loadSalesStages = async () => {
    setIsLoadingSalesStages(true);
    setSalesStagesError(null);
    
    try {
      const stages = await codeAPI.getSalesMetadata();
      setAllSalesStages(stages);
    } catch (error) {
      const errorMessage = apiUtils.formatErrorMessage(error);
      setSalesStagesError(errorMessage);
    } finally {
      setIsLoadingSalesStages(false);
    }
  };

  // 단계 선택 함수들
  const handleToggleManualStage = (stageId: number) => {
    setSelectedManualStages(prev => 
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const handleToggleAIStage = (stageId: number) => {
    setRemovedAIStages(prev => 
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const handleToggleParentStage = (parent: SalesStageParent) => {
    const childIds = parent.child_list.map(child => child.id);
    const allChildrenSelected = childIds.every(id => 
      (analysis?.stages.some(stage => stage.id === id) && !removedAIStages.includes(id)) ||
      selectedManualStages.includes(id)
    );

    if (allChildrenSelected) {
      childIds.forEach(id => {
        if (analysis?.stages.some(stage => stage.id === id)) {
          handleToggleAIStage(id);
        } else {
          setSelectedManualStages(prev => prev.filter(selectedId => selectedId !== id));
        }
      });
    } else {
      childIds.forEach(id => {
        const isAIStage = analysis?.stages.some(stage => stage.id === id);
        const isAIRemoved = removedAIStages.includes(id);
        const isManualSelected = selectedManualStages.includes(id);

        if (isAIStage && isAIRemoved) {
          handleToggleAIStage(id);
        } else if (!isAIStage && !isManualSelected) {
          setSelectedManualStages(prev => [...prev, id]);
        }
      });
    }
  };

  const getParentCheckState = (parent: SalesStageParent) => {
    const childIds = parent.child_list.map(child => child.id);
    const selectedChildren = childIds.filter(id =>
      (analysis?.stages.some(stage => stage.id === id) && !removedAIStages.includes(id)) ||
      selectedManualStages.includes(id)
    );

    if (selectedChildren.length === 0) return 'unchecked' as const;
    if (selectedChildren.length === childIds.length) return 'checked' as const;
    return 'indeterminate' as const;
  };

  const getCombinedStages = () => {
    const llmStages = (analysis?.stages || []).filter(stage => !removedAIStages.includes(stage.id));
    const manualStages: Array<{id: number, name: string}> = [];
    
    allSalesStages.forEach(parent => {
      parent.child_list.forEach(child => {
        if (selectedManualStages.includes(child.id)) {
          manualStages.push({ id: child.id, name: child.name });
        }
      });
    });
    
    const combined = [...llmStages];
    manualStages.forEach(manual => {
      const exists = llmStages.some(llm => llm.id === manual.id);
      if (!exists) {
        combined.push({ ...manual, confidence: 1.0 });
      }
    });
    
    return combined;
  };

  return {
    // 분석 관련
    llmAnalysis: analysis,
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
  };
}