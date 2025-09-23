// =============================================================================
// API Configuration & Types
// =============================================================================

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 플랫폼별 API URL 설정
const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // 현재 환경 정보 로그
  console.log('🔍 API URL 설정:', {
    location: window.location,
    envUrl,
    isCapacitor: window.location.protocol === 'https:' && window.location.hostname === 'localhost'
  });

  return envUrl;
};

const API_BASE_URL = getApiUrl();

// =============================================================================
// Common Types
// =============================================================================

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

export const ERROR_MESSAGES = {
  UNKNOWN_ERROR: 'An unknown error occurred',
  NETWORK_ERROR: 'Network error occurred',
  SERVER_ERROR: 'Server error occurred'
} as const;

// =============================================================================
// Todo Related Types
// =============================================================================

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

// =============================================================================
// Consultation Related Types
// =============================================================================

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
  data: Record<string, never>;
}

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
  start_date?: string; // YYYY-MM-DD format
  end_date?: string;   // YYYY-MM-DD format
}

export interface ConsultListResponse {
  status: number;
  message: string;
  data: {
    list: ConsultListItem[];
    total: number;
  };
}

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

// =============================================================================
// Chatbot Related Types
// =============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotRequest {
  question: string;
  q_history?: ChatMessage[];
}

export interface ChatbotSource {
  type: 'consult' | 'document';
  file_info: string;
  excerpt: string;
}

export interface ChatbotResponseData {
  answer: string;
  sources: ChatbotSource[];
}

export interface ChatbotResponse {
  status: number;
  message: string;
  data: ChatbotResponseData;
}

// =============================================================================
// Sales Metadata Types
// =============================================================================

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

// =============================================================================
// Core Fetch Function
// =============================================================================

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log('🌐 API 요청:', { url, method: config.method || 'GET', API_BASE_URL });

  try {
    const response = await fetch(url, config);
    console.log('✅ API 응답:', { status: response.status, ok: response.ok, url });
    
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

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    console.error('❌ API 요청 실패:', { url, error });

    if (error instanceof APIError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
    throw new APIError(0, message, error);
  }
}

// =============================================================================
// Todo API Services
// =============================================================================

export const todoAPI = {
  // 할 일 목록 조회
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

  // 할 일 완료 상태 토글
  toggleTodoComplete: async (id: number, completed: boolean): Promise<void> => {
    await fetchAPI<APIResponse<{}>>(`/api/todos/complete`, {
      method: 'PUT',
      body: JSON.stringify({ id, completed }),
    });
  },

  // 할 일 생성
  createTodo: async (todoData: Omit<TodoItem, 'id' | 'created_at'>): Promise<TodoItem> => {
    const response = await fetchAPI<APIResponse<TodoItem>>('/api/todos', {
      method: 'POST',
      body: JSON.stringify(todoData),
    });
    
    return response.data;
  },

  // 할 일 수정
  updateTodo: async (id: number, todoData: Partial<TodoItem>): Promise<TodoItem> => {
    const response = await fetchAPI<APIResponse<TodoItem>>(`/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todoData),
    });
    
    return response.data;
  },

  // 할 일 삭제
  deleteTodo: async (id: number): Promise<void> => {
    await fetchAPI<void>(`/api/todos/${id}`, {
      method: 'DELETE',
    });
  },

  // 특정 할 일 조회
  getTodoById: async (id: number): Promise<TodoItem> => {
    const response = await fetchAPI<APIResponse<TodoItem>>(`/api/todos/${id}`, {
      method: 'GET',
    });
    
    return response.data;
  }
};

// =============================================================================
// Consultation API Services
// =============================================================================

export const consultAPI = {
  // 상담 내용 AI 분석
  analyzeConsultation: async (consultText: string): Promise<ConsultAnalysisData> => {
    const response = await fetchAPI<ConsultAnalysisResponse>('/api/consult/analyze', {
      method: 'POST',
      body: JSON.stringify({ consult_text: consultText }),
    });
        
    return response.data;
  },

  // 상담 정보 저장
  saveConsultation: async (
    customerId: number, 
    consultText: string, 
    contentType: 'voice' | 'text',
    stages: ConsultSaveStage[]
  ): Promise<void> => {
    await fetchAPI<ConsultSaveResponse>('/api/consult/', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        consult_text: consultText,
        content_type: contentType,
        stages
      }),
    });
  },

  // 상담 내역 목록 조회
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

  // 고객 정보 조회
  getCustomerInfo: async (): Promise<CustomerInfo> => {
    const response = await fetchAPI<CustomerInfoResponse>('/api/consult/cust', {
      method: 'GET',
    });
    
    return response.data.cust_info;
  },

  // 상담 상세 내역 조회
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

  // 챗봇에게 질문 전송
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

// =============================================================================
// Sales Metadata API Services
// =============================================================================

export const codeAPI = {
  // 영업 단계 메타데이터 조회
  getSalesMetadata: async (): Promise<SalesStageParent[]> => {
    const response = await fetchAPI<SalesMetaResponse>('/api/salesmeta', {
      method: 'GET',
    });
    
    return response.data.list;
  }
};

// =============================================================================
// Utility Functions
// =============================================================================

export const apiUtils = {
  // 에러 메시지 포맷팅
  formatErrorMessage: (error: unknown): string => {
    if (error instanceof APIError) {
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  },

  // 재시도 기능이 있는 API 호출
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

  // 날짜 포맷팅 (한국어)
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

  // 마감일 체크
  isOverdue: (dueDateString: string): boolean => {
    const dueDate = new Date(dueDateString);
    const now = new Date();
    return dueDate < now;
  },

  // 오늘 날짜 체크
  isToday: (dueDateString: string): boolean => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  }
};