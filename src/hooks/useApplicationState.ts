import { useReducer, useMemo } from 'react';
import type { Page, RecordingContext, User } from '../types/index';

interface ApplicationState {
  readonly currentPage: Page;
  readonly selectedCustomerId: string | null;
  readonly recordingContext: RecordingContext | null;
  readonly user: User | null;
  
  readonly sttResult: {
    transcript: string;
    consultationData: any;
    aiInsights: any;
  } | null;

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
  | { type: 'FINISH_RECORDING'; payload: { transcript: string; consultationData: any; aiInsights: any } }
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' };

const reducer = (state: ApplicationState, action: StateAction): ApplicationState => {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        ...state,
        currentPage: action.payload,
        selectedCustomerId: action.payload === 'client-detail' ? state.selectedCustomerId : null,
        recordingContext: action.payload === 'record' ? state.recordingContext : null,
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

    case 'LOGIN':
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        currentPage: 'dashboard',
        user: action.payload.user,
      };

    case 'LOGOUT':
      localStorage.removeItem('user');
      return {
        ...getInitialState(),
        currentPage: 'login',
      };

    default:
      return state;
  }
};

const getInitialState = (): ApplicationState => {
  const defaultState = {
    currentPage: 'login' as Page,
    selectedCustomerId: null,
    recordingContext: null,
    user: null,
    sttResult: null,
    recordingData: null,
  };

  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return {
        ...defaultState,
        currentPage: 'dashboard',
        user,
      };
    }
  } catch (error) {
    localStorage.removeItem('user');
    if (import.meta.env.DEV) {
      console.warn('localStorage에서 잘못된 사용자 데이터 제거:', error);
    }
  }

  return defaultState;
};

export const useApplicationState = () => {
  const [state, dispatch] = useReducer(reducer, getInitialState());

  const actions = useMemo(
    () => ({
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

      finishRecording: (result: {
        transcript: string;
        consultationData: any;
        aiInsights: any;
      }) => dispatch({ type: 'FINISH_RECORDING', payload: result }),

      login: (user: User) => dispatch({ type: 'LOGIN', payload: { user } }),
      logout: () => dispatch({ type: 'LOGOUT' }),
    }),
    []
  );

  return { state, actions } as const;
};