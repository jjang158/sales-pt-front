import { useState, useCallback, useRef, useEffect } from 'react';
import { consultAPI, ConsultListItem, apiUtils } from '../lib/api';


// 로컬 타입 정의
interface ConsultListParams {
  customer_name?: string;
  start_date?: string; // YYYY-MM-DD 형식
  end_date?: string;   // YYYY-MM-DD 형식
}

export interface ConsultHistoryState {
  consultList: ConsultListItem[];
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
}

export interface UseConsultHistoryOptions {
  autoLoad?: boolean;
  defaultParams?: ConsultListParams;
  onSuccess?: (consultList: ConsultListItem[]) => void;
  onError?: (error: string) => void;
}

export function useConsultHistory(options: UseConsultHistoryOptions = {}) {
  const {
    autoLoad = true,
    defaultParams = {},
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<ConsultHistoryState>({
    consultList: [],
    isLoading: false,
    error: null,
    hasData: false
  });

  const [currentParams, setCurrentParams] = useState<ConsultListParams>(defaultParams);
  
  const callbacksRef = useRef({ onSuccess, onError });
  const mountedRef = useRef(true);
  const currentRequestRef = useRef<Promise<ConsultListItem[]> | null>(null);

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  

  useEffect(() => {
    callbacksRef.current = { onSuccess, onError };
  }, [onSuccess, onError]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 상담 내역 조회
  const loadConsultHistory = useCallback(async (params?: ConsultListParams) => {
    const finalParams = params || currentParams;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const requestPromise = apiUtils.withRetry(() => 
        consultAPI.getConsultList(finalParams)
      );
      currentRequestRef.current = requestPromise;

      const consultList = await requestPromise;

      if (!mountedRef.current || currentRequestRef.current !== requestPromise) {
        return consultList;
      }

      setState(prev => ({
        ...prev,
        consultList,
        isLoading: false,
        hasData: true
      }));

      callbacksRef.current.onSuccess?.(consultList);
      return consultList;
    } catch (error) {
      if (!mountedRef.current) {
        return [];
      }

      const errorMessage = apiUtils.formatErrorMessage(error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      callbacksRef.current.onError?.(errorMessage);
      throw error;
    } finally {
      currentRequestRef.current = null;
    }
  }, [currentParams]);

  // 새로고침
  const refresh = useCallback(() => {
    return loadConsultHistory();
  }, [loadConsultHistory]);

  // 검색 파라미터 업데이트
  const updateSearchParams = useCallback((newParams: ConsultListParams) => {
    setCurrentParams(prevParams => ({ ...prevParams, ...newParams }));
  }, []);

  // 고객명으로 검색
  const searchByCustomer = useCallback((customerName: string) => {
    const params: ConsultListParams = { customer_name: customerName };
    setCurrentParams(params);
    return loadConsultHistory(params);
  }, [loadConsultHistory]);

  // 기간으로 검색
  const searchByDateRange = useCallback((startDate: string, endDate: string) => {
    const params: ConsultListParams = { 
      start_date: startDate, 
      end_date: endDate 
    };
    setCurrentParams(params);
    return loadConsultHistory(params);
  }, [loadConsultHistory]);

  // 고객명 + 기간으로 검색
  const searchByCustomerAndDate = useCallback((
    customerName: string, 
    startDate: string, 
    endDate: string
  ) => {
    const params: ConsultListParams = {
      customer_name: customerName,
      start_date: startDate,
      end_date: endDate
    };
    setCurrentParams(params);
    return loadConsultHistory(params);
  }, [loadConsultHistory]);

  // 검색 초기화
  const clearSearch = useCallback(() => {
    setCurrentParams({});
    return loadConsultHistory({});
  }, [loadConsultHistory]);

  // 에러 초기화
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 날짜 형식 유틸리티 (YYYY-MM-DD)
  const formatDate = useCallback((date: Date): string => {
    return date.toISOString().split('T')[0];
  }, []);

  // 오늘 날짜 기준 검색
  const searchToday = useCallback(() => {
    const today = formatDate(new Date());
    return searchByDateRange(today, today);
  }, [searchByDateRange, formatDate]);

  // 이번 주 검색
  const searchThisWeek = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // 일요일
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 토요일
    
    return searchByDateRange(formatDate(startOfWeek), formatDate(endOfWeek));
  }, [searchByDateRange, formatDate]);

  // 이번 달 검색
  const searchThisMonth = useCallback(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return searchByDateRange(formatDate(startOfMonth), formatDate(endOfMonth));
  }, [searchByDateRange, formatDate]);

  // 통계 정보 계산
  const statistics = {
    totalCustomers: state.consultList.length,
    totalConsults: state.consultList.reduce((sum, item) => sum + item.consult_count, 0),
    totalActions: state.consultList.reduce((sum, item) => sum + item.action_count, 0),
    totalPending: state.consultList.reduce((sum, item) => sum + item.pending_count, 0),
    averageConsultsPerCustomer: state.consultList.length > 0 
      ? Math.round(state.consultList.reduce((sum, item) => sum + item.consult_count, 0) / state.consultList.length)
      : 0,
    completionRate: (() => {
      const totalActions = state.consultList.reduce((sum, item) => sum + item.action_count, 0);
      const totalConsults = state.consultList.reduce((sum, item) => sum + item.consult_count, 0);
      return totalConsults > 0 ? Math.round((totalActions / totalConsults) * 100) : 0;
    })()
  };

  // 고객별 정렬
  const sortedConsultList = {
    byName: [...state.consultList].sort((a, b) => a.customer_name.localeCompare(b.customer_name)),
    byConsultCount: [...state.consultList].sort((a, b) => b.consult_count - a.consult_count),
    byPendingCount: [...state.consultList].sort((a, b) => b.pending_count - a.pending_count),
    byActionCount: [...state.consultList].sort((a, b) => b.action_count - a.action_count)
  };

  // 초기 로딩
  useEffect(() => {
    if (autoLoad) {
      loadConsultHistory();
    }
  }, [autoLoad, loadConsultHistory]);

  // 파라미터 변경 시 자동 reload
  useEffect(() => {
    if (state.hasData) {
      loadConsultHistory();
    }
  }, [currentParams, loadConsultHistory]);

  return {
    // 상태
    ...state,
    currentParams,
    
    // 액션
    loadConsultHistory,
    refresh,
    updateSearchParams,
    searchByCustomer,
    searchByDateRange,
    searchByCustomerAndDate,
    clearSearch,
    clearError,
    
    // 편의 검색 기능
    searchToday,
    searchThisWeek,
    searchThisMonth,
    formatDate,
    
    // 계산된 값들
    statistics,
    sortedConsultList,
    
    // 유틸리티
    isEmpty: state.consultList.length === 0,
    hasError: !!state.error,
    hasPendingCustomers: state.consultList.some(item => item.pending_count > 0),
    highActivityCustomers: state.consultList.filter(item => item.consult_count >= 5),
    
    // 검색 관련
    hasActiveSearch: Object.keys(currentParams).length > 0,
    isSearching: state.isLoading && state.hasData
  };
}