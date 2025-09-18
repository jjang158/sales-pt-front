import { useMemo, useReducer } from 'react';
import type { Page, RecordingContext } from '../types/index';

interface ApplicationState {
  readonly currentPage: Page;
  readonly selectedCustomerId: string | null;
  readonly recordingContext: RecordingContext | null;
  
  // 🔥 STT 결과 저장
  readonly sttResult: {
    transcript: string;
    consultationData: any;
    aiInsights: any;
  } | null;
  
  // 🔥 새로 추가: RecordPage에서 전달된 데이터
  readonly recordingData: {
    recordedText: string;
    context: any;
    audioBlob?: Blob;
    recordingInfo: {
      duration: string;
      fileSize: string;
      wordCount: number;
      confidence: number;
    };
  } | null;
}

type StateAction =
  | { type: 'NAVIGATE'; payload: Page }
  | { type: 'NAVIGATE_WITH_DATA'; payload: { page: Page; data: any } }
  | { type: 'SELECT_CUSTOMER'; payload: { customerId: string } }
  | { type: 'START_RECORDING'; payload: { context: RecordingContext } }
  | { type: 'FINISH_RECORDING'; payload: { transcript: string; consultationData: any; aiInsights: any } };

const reducer = (state: ApplicationState, action: StateAction): ApplicationState => {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        ...state,
        currentPage: action.payload,
        selectedCustomerId: action.payload === 'client-detail' ? state.selectedCustomerId : null,
        recordingContext: action.payload === 'record' ? state.recordingContext : null,
        // review 페이지가 아니면 recordingData 초기화
        recordingData: action.payload === 'review' ? state.recordingData : null,
      };
      
    case 'NAVIGATE_WITH_DATA':
      return {
        ...state,
        currentPage: action.payload.page,
        selectedCustomerId: action.payload.page === 'client-detail' ? state.selectedCustomerId : null,
        recordingContext: action.payload.page === 'record' ? state.recordingContext : null,
        // 🔥 RecordPage에서 전달된 데이터 저장
        recordingData: action.payload.page === 'review' ? action.payload.data : null,
        // 🔥 recordingData를 sttResult 형식으로 자동 변환
        sttResult: action.payload.page === 'review' && action.payload.data ? {
          transcript: action.payload.data.recordedText,
          consultationData: {
            context: action.payload.data.context,
            recordingInfo: action.payload.data.recordingInfo,
            audioBlob: action.payload.data.audioBlob
          },
          aiInsights: null
        } : state.sttResult,
      };
      
    case 'SELECT_CUSTOMER':
      return {
        ...state,
        currentPage: 'client-detail',
        selectedCustomerId: action.payload.customerId,
        recordingContext: null,
        recordingData: null,
      };
      
    case 'START_RECORDING':
      return {
        ...state,
        currentPage: 'record',
        recordingContext: action.payload.context,
        selectedCustomerId: null,
        recordingData: null,
      };
      
    case 'FINISH_RECORDING':
      return {
        ...state,
        currentPage: 'review',
        sttResult: action.payload,
        recordingData: null,
      };
      
    default:
      return state;
  }
};

const initialState: ApplicationState = {
  currentPage: 'dashboard',
  selectedCustomerId: null,
  recordingContext: null,
  sttResult: null,
  recordingData: null, // 🔥 초기값 추가
};

/**
 * Type-safe application state with auto-cleanup
 */
export const useApplicationState = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      // 🔥 기존 navigateTo - 데이터 없이 페이지만 이동
      navigateTo: (page: Page, data?: any) => {
        if (data) {
          dispatch({ type: 'NAVIGATE_WITH_DATA', payload: { page, data } });
        } else {
          dispatch({ type: 'NAVIGATE', payload: page });
        }
      },
      
      selectCustomer: (customerId: string) =>
        dispatch({ type: 'SELECT_CUSTOMER', payload: { customerId } }),
        
      startRecording: (context: RecordingContext) =>
        dispatch({ type: 'START_RECORDING', payload: { context } }),

      // 🔥 STT 완료 후 결과 저장 + review 이동
      finishRecording: (result: {
        transcript: string;
        consultationData: any;
        aiInsights: any;
      }) => dispatch({ type: 'FINISH_RECORDING', payload: result }),
    }),
    []
  );

  return { state, actions } as const;
};