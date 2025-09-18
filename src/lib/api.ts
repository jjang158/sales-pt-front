// Vite 환경변수 타입 정의
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 서버 주소 연결
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface TodoItem {
  id: number;
  customer_id: number;
  due_date: string;
  title: string;
  description: string;
  is_completed: boolean;
  created_at: string;
  customer_name: string;
}

export interface TodoListParams {
  customer_id?: number;
  is_completed?: boolean;
}

// 상담 분석 관련 타입들
export interface ConsultAnalysisRequest {
  consult_text: string;
}

export interface ConsultStage {
  id: number;
  name: string;
  confidence: number;
}

export interface ConsultAnalysisData {
  summary: string;
  stages: ConsultStage[];
}

export interface ConsultAnalysisResponse {
  status: number;
  message: string;
  data: ConsultAnalysisData;
}

// 상담 정보 저장 관련 타입들
export interface ConsultSaveStage {
  stage_meta_id: number;
  stage_name: string;
}

export interface ConsultSaveRequest {
  customer_id: number;
  consult_text: string;
  content_type: 'voice' | 'text';
  stages: ConsultSaveStage[];
}

export interface ConsultSaveResponse {
  status: number;
  message: string;
  data: Record<string, never>; // 빈 객체
}

// API 응답 타입 통일
export interface APIResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 에러 메시지 상수화 (국제화 대응)
export const ERROR_MESSAGES = {
  UNKNOWN_ERROR: 'An unknown error occurred',
  NETWORK_ERROR: 'Network error occurred',
  SERVER_ERROR: 'Server error occurred'
} as const;

// 기본 fetch 래퍼 함수
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        errorData = await response.json().catch(() => ({}));
      } else {
        errorData = { message: `HTTP ${response.status}` };
      }
      
      throw new APIError(
        response.status,
        errorData.message || `HTTP Error: ${response.status}`,
        errorData
      );
    }

    // 응답이 비어있을 수 있는 경우 처리 (DELETE 등)
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // 네트워크 에러나 기타 에러 처리
    const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
    throw new APIError(0, message, error);
  }
}

// Todo API 서비스
export const todoAPI = {
  // Todo 목록 조회
  getTodoList: async (params: TodoListParams = {}): Promise<TodoItem[]> => {
    const searchParams = new URLSearchParams();
    
    if (params.customer_id !== undefined) {
      searchParams.append('customer_id', params.customer_id.toString());
    }
    
    if (params.is_completed !== undefined) {
      searchParams.append('is_completed', params.is_completed.toString());
    }

    const query = searchParams.toString();
    const endpoint = `/api/todos${query ? `?${query}` : ''}`;
    
    const response = await fetchAPI<APIResponse<TodoItem[]>>(endpoint, {
      method: 'GET',
    }); 
    
    return response.data;
  },


  toggleTodoComplete: async (id: number, completed: boolean): Promise<void> => {
    const response = await fetchAPI<APIResponse<{}>>(`/api/todos/complete`, {
      method: 'PUT', // 또는 POST - 서버 사양에 따라
      body: JSON.stringify({ 
        id: id,
        completed: completed 
      }),
    });
    
    // 응답이 빈 객체이므로 void 반환
    return;
  },

  // Todo 생성
  createTodo: async (todoData: Omit<TodoItem, 'id' | 'created_at'>): Promise<TodoItem> => {
    const response = await fetchAPI<APIResponse<TodoItem>>('/api/todos', {
      method: 'POST',
      body: JSON.stringify(todoData),
    });
    
    return response.data;
  },

  // Todo 업데이트
  updateTodo: async (id: number, todoData: Partial<TodoItem>): Promise<TodoItem> => {
    const response = await fetchAPI<APIResponse<TodoItem>>(`/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todoData),
    });
    
    return response.data;
  },

  // Todo 삭제
  deleteTodo: async (id: number): Promise<void> => {
    await fetchAPI<void>(`/api/todos/${id}`, {
      method: 'DELETE',
    });
  },

  // 특정 Todo 조회
  getTodoById: async (id: number): Promise<TodoItem> => {
    const response = await fetchAPI<APIResponse<TodoItem>>(`/api/todos/${id}`, {
      method: 'GET',
    });
    
    return response.data;
  }
};

export const consultAPI = {
  // 상담 내용 LLM 분석 요청: POST /api/consult/analyze
  analyzeConsultation: async (consultText: string): Promise<ConsultAnalysisData> => {
    const requestData: ConsultAnalysisRequest = {
      consult_text: consultText
    };

    const response = await fetchAPI<ConsultAnalysisResponse>('/api/consult/analyze', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
        
    return response.data;
  },

  // 상담 정보 저장: POST /api/consult
  saveConsultation: async (
    customerId: number, 
    consultText: string, 
    contentType: 'voice' | 'text',
    stages: ConsultSaveStage[]
  ): Promise<void> => {
    const requestData: ConsultSaveRequest = {
      customer_id: customerId,
      consult_text: consultText,
      content_type: contentType,
      stages
    };

    await fetchAPI<ConsultSaveResponse>('/api/consult/', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // 👈 여기에 추가
  getConsultList: async (params: ConsultListParams = {}): Promise<ConsultListItem[]> => {
    const searchParams = new URLSearchParams();
         
    if (params.customer_name) {
      searchParams.append('customer_name', params.customer_name);
    }
         
    if (params.start_date) {
      searchParams.append('start_date', params.start_date);
    }
         
    if (params.end_date) {
      searchParams.append('end_date', params.end_date);
    }

    const query = searchParams.toString();
    const endpoint = `/api/consult/list${query ? `?${query}` : ''}`;
         
    const response = await fetchAPI<ConsultListResponse>(endpoint, {
      method: 'GET',
    });
         
    return response.data.list;
  },
  getCustomerInfo: async (): Promise<CustomerInfo> => {
    const response = await fetchAPI<CustomerInfoResponse>('/api/consult/cust', {
      method: 'GET',
    });
    
    return response.data.cust_info;
  },

  getConsultDetails: async (params: ConsultDetailParams): Promise<ConsultDetailItem[]> => {
    const searchParams = new URLSearchParams();
    searchParams.append('customer_id', params.customer_id.toString());
    
    if (params.type) {
      searchParams.append('type', params.type);
    }

    const query = searchParams.toString();
    const endpoint = `/api/consult/detail?${query}`;
    
    const response = await fetchAPI<ConsultDetailResponse>(endpoint, {
      method: 'GET',
    });
    
    return response.data.list;
  },

  // 챗봇 질문 전송
  sendChatMessage: async (question: string, history?: ChatMessage[]): Promise<ChatbotResponseData> => {
    const requestData: ChatbotRequest = {
      question,
      ...(history && history.length > 0 && { q_history: history })
    };

    const response = await fetchAPI<ChatbotResponse>('/api/chatbot/query', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    
    return response.data;
  }
};

// 유틸리티 함수들
export const apiUtils = {
  formatErrorMessage: (error: unknown): string => {
    if (error instanceof APIError) {
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  },

  withRetry: async <T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // 4xx 에러는 재시도하지 않음 (클라이언트 에러)
        if (error instanceof APIError && error.status >= 400 && error.status < 500) {
          break;
        }
        
        // 점진적 지연 후 재시도
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
    
    throw lastError;
  },

  // 개발 모드에서 API 호출 로깅
  logAPICall: (method: string, endpoint: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`🔗 API ${method} ${endpoint}`, data);
    }
  },

  // 날짜 관련 유틸리티
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  isOverdue: (dueDateString: string): boolean => {
    const dueDate = new Date(dueDateString);
    const now = new Date();
    return dueDate < now;
  },

  isToday: (dueDateString: string): boolean => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  }
};

// 상담 내역 조회 관련 타입들 (누락된 부분)
export interface ConsultListItem {
  customer_id: number;
  customer_name: string;
  consult_count: number;
  action_count: number;
  pending_count: number;
  last_consult_date?: string;
}

export interface ConsultListParams {
  customer_name?: string;
  start_date?: string; // YYYY-MM-DD 형식
  end_date?: string;   // YYYY-MM-DD 형식
}

export interface ConsultListResponse {
  status: number;
  message: string;
  data: {
    list: ConsultListItem[];
    total: number;
  };
}
// 기존 타입들 아래에 추가
export interface CustomerInfo {
  cust_name: string;
  email: string;
  phone_number: string;
  consult_count: number;
  action_count: number;
  pending_count: number;
}

export interface CustomerInfoResponse {
  status: number;
  message: string;
  data: {
    cust_info: CustomerInfo;
  };
}

export interface ConsultStageItem {
  stage_name: string;
}

export interface ConsultDetailItem {
  type: 'voice' | 'text';
  title: string;
  content: string;
  consult_stage: ConsultStageItem[];
}

export interface ConsultDetailParams {
  customer_id: number;
  type?: 'active' | 'completed';
}

export interface ConsultDetailResponse {
  status: number;
  message: string;
  data: {
    list: ConsultDetailItem[];
  };
}

// 챗봇 메시지 히스토리 타입
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 챗봇 요청 타입
export interface ChatbotRequest {
  question: string;
  q_history?: ChatMessage[];
}

// 챗봇 응답의 소스 정보
export interface ChatbotSource {
  type: 'consult' | 'document';
  file_info :  string;
  excerpt: string;
}

// 챗봇 응답 데이터
export interface ChatbotResponseData {
  answer: string;
  sources: ChatbotSource[];
}

// 챗봇 API 응답
export interface ChatbotResponse {
  status: number;
  message: string;
  data: ChatbotResponseData;
}

//영업 단계 조회 API(Select Box)
// 기존 타입들 아래에 추가할 영업 단계 관련 타입들
export interface SalesStageChild {
  id: number;
  name: string;
  order: number;
  parent_id: number;
}

export interface SalesStageParent {
  id: number;
  name: string;
  order: number;
  parent_id: number;
  child_list: SalesStageChild[];
}

export interface SalesMetaResponse {
  status: number;
  message: string;
  data: {
    list: SalesStageParent[];
  };
}

// 기존 consultAPI 객체에 추가하거나, 새로운 codeAPI로 분리할 수 있습니다:
export const codeAPI = {
  // 영업 단계 메타데이터 조회
  getSalesMetadata: async (): Promise<SalesStageParent[]> => {
    const response = await fetchAPI<SalesMetaResponse>('/api/salesmeta', {
      method: 'GET',
    });
    
    return response.data.list;
  }
};