import { useState, useCallback, useRef, useEffect } from 'react';
import { consultAPI, ConsultAnalysisData, apiUtils } from '../lib/api';

// 상담 저장 관련 타입 (로컬 정의)
interface ConsultSaveStage {
  stage_meta_id: number;
  stage_name: string;
}

export interface ConsultAnalysisState {
  result: ConsultAnalysisData | null;
  isAnalyzing: boolean;
  error: string | null;
  hasAnalyzed: boolean;
  isSaving: boolean;
  saveError: string | null;
  hasSaved: boolean;
}

export interface UseConsultAnalysisOptions {
  onSuccess?: (result: ConsultAnalysisData) => void;
  onError?: (error: string) => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
  autoCopyToClipboard?: boolean;
}

export function useConsultAnalysis(options: UseConsultAnalysisOptions = {}) {
  const { onSuccess, onError, onSaveSuccess, onSaveError, autoCopyToClipboard = false } = options;

  const [state, setState] = useState<ConsultAnalysisState>({
    result: null,
    isAnalyzing: false,
    error: null,
    hasAnalyzed: false,
    isSaving: false,
    saveError: null,
    hasSaved: false
  });

  const callbacksRef = useRef({ onSuccess, onError, onSaveSuccess, onSaveError });
  const mountedRef = useRef(true);
  const currentRequestRef = useRef<Promise<ConsultAnalysisData> | null>(null);

  useEffect(() => {
    callbacksRef.current = { onSuccess, onError, onSaveSuccess, onSaveError };
  }, [onSuccess, onError, onSaveSuccess, onSaveError]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const analyzeConsultation = useCallback(async (consultText: string) => {
    if (!consultText || consultText.trim().length === 0) {
      const errorMessage = '분석할 상담 내용을 입력해주세요.';
      setState(prev => ({ ...prev, error: errorMessage }));
      callbacksRef.current.onError?.(errorMessage);
      return;
    }

    if (consultText.trim().length < 10) {
      const errorMessage = '분석하기에 상담 내용이 너무 짧습니다. (최소 10자 이상)';
      setState(prev => ({ ...prev, error: errorMessage }));
      callbacksRef.current.onError?.(errorMessage);
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isAnalyzing: true, 
      error: null,
      result: null 
    }));

    try {
      const requestPromise = apiUtils.withRetry(() => 
        consultAPI.analyzeConsultation(consultText)
      );
      currentRequestRef.current = requestPromise;

      const result = await requestPromise;

      if (!mountedRef.current || currentRequestRef.current !== requestPromise) {
        return result;
      }

      setState(prev => ({
        ...prev,
        result,
        isAnalyzing: false,
        hasAnalyzed: true
      }));

      callbacksRef.current.onSuccess?.(result);

      if (autoCopyToClipboard && navigator.clipboard) {
        try {
          const summaryText = `상담 요약: ${result.summary}\n\n상담 단계:\n${
            result.stages.map(stage => 
              `- ${stage.name} (신뢰도: ${Math.round(stage.confidence * 100)}%)`
            ).join('\n')
          }`;
          
          await navigator.clipboard.writeText(summaryText);
        } catch (clipboardError) {
          console.warn('클립보드 복사 실패:', clipboardError);
        }
      }

      return result;
    } catch (error) {
      if (!mountedRef.current) {
        return null;
      }

      const errorMessage = apiUtils.formatErrorMessage(error);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage
      }));

      callbacksRef.current.onError?.(errorMessage);
      throw error;
    } finally {
      currentRequestRef.current = null;
    }
  }, [autoCopyToClipboard]);

  const saveConsultation = useCallback(async (
    customerId: number,
    consultText: string,
    contentType: 'voice' | 'text' = 'voice'
  ) => {
    if (!state.result) {
      const errorMessage = '저장할 분석 결과가 없습니다.';
      setState(prev => ({ ...prev, saveError: errorMessage }));
      callbacksRef.current.onSaveError?.(errorMessage);
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isSaving: true, 
      saveError: null 
    }));

    try {
      const stages: ConsultSaveStage[] = state.result.stages.map(stage => ({
        stage_meta_id: stage.id,
        stage_name: stage.name
      }));

      await apiUtils.withRetry(() => 
        consultAPI.saveConsultation(customerId, consultText, contentType, stages)
      );

      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        isSaving: false,
        hasSaved: true
      }));

      callbacksRef.current.onSaveSuccess?.();

    } catch (error) {
      if (!mountedRef.current) return;

      const errorMessage = apiUtils.formatErrorMessage(error);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: errorMessage
      }));

      callbacksRef.current.onSaveError?.(errorMessage);
      throw error;
    }
  }, [state.result]);

  const analyzeAndSaveConsultation = useCallback(async (
    consultText: string,
    customerId: number,
    contentType: 'voice' | 'text' = 'voice'
  ) => {
    try {
      await analyzeConsultation(consultText);
      
      setTimeout(() => {
        if (mountedRef.current) {
          saveConsultation(customerId, consultText, contentType);
        }
      }, 500);
      
    } catch (error) {
      throw error;
    }
  }, [analyzeConsultation, saveConsultation]);

  const clearResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: null,
      error: null,
      hasAnalyzed: false,
      saveError: null,
      hasSaved: false
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, saveError: null }));
  }, []);

  const cancelAnalysis = useCallback(() => {
    if (currentRequestRef.current) {
      currentRequestRef.current = null;
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: '분석이 취소되었습니다.'
      }));
    }
  }, []);

  const copyResultToClipboard = useCallback(async () => {
    if (!state.result || !navigator.clipboard) {
      return false;
    }

    try {
      const summaryText = `상담 요약: ${state.result.summary}\n\n상담 단계:\n${
        state.result.stages.map(stage => 
          `- ${stage.name} (신뢰도: ${Math.round(stage.confidence * 100)}%)`
        ).join('\n')
      }`;
      
      await navigator.clipboard.writeText(summaryText);
      return true;
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      return false;
    }
  }, [state.result]);

  const downloadResultAsText = useCallback((filename?: string) => {
    if (!state.result) return;

    const summaryText = `상담 분석 결과\n${'='.repeat(20)}\n\n` +
      `상담 요약:\n${state.result.summary}\n\n` +
      `상담 단계 분석:\n${
        state.result.stages.map(stage => 
          `${stage.id}. ${stage.name}\n   신뢰도: ${Math.round(stage.confidence * 100)}%`
        ).join('\n')
      }\n\n` +
      `생성 일시: ${new Date().toLocaleString('ko-KR')}`;

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename || `상담분석_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [state.result]);

  const resultStats = state.result ? {
    totalStages: state.result.stages.length,
    averageConfidence: state.result.stages.length > 0 
      ? state.result.stages.reduce((sum, stage) => sum + stage.confidence, 0) / state.result.stages.length
      : 0,
    highConfidenceStages: state.result.stages.filter(stage => stage.confidence >= 0.8),
    summaryLength: state.result.summary.length,
    summaryWordCount: state.result.summary.trim().split(/\s+/).length
  } : null;

  return {
    ...state,
    
    analyzeConsultation,
    saveConsultation,
    analyzeAndSaveConsultation,
    clearResult,
    clearError,
    cancelAnalysis,
    
    copyResultToClipboard,
    downloadResultAsText,
    resultStats,
    
    hasResult: !!state.result,
    hasError: !!state.error || !!state.saveError,
    canAnalyze: !state.isAnalyzing,
    canSave: !!state.result && !state.isSaving,
    hasHighConfidenceStages: resultStats ? resultStats.highConfidenceStages.length > 0 : false,
    isProcessing: state.isAnalyzing || state.isSaving
  };
}