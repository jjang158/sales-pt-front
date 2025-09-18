export type Page = 'chatbot'|'todo' |'dashboard' | 'client-detail' | 'settings' | 'review' | 'record' | 'integrated-customer';

export interface RecordingContext {
  type: 'task' | 'customer';
  name: string;
  id: string;
}

export interface NavigationProps {
  onNavigate: (page: Page) => void;
  onSelectCustomer?: (customerId: string) => void;
  onStartRecording?: (context: RecordingContext) => void;
}

export interface Customer {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  interestedProduct: string;
  stage: 'lead' | 'prospect' | 'opportunity' | 'customer';
  lastContact: string;
  avatar: string;
  birthday: string; // YYYY-MM-DD format
  registrationDate?: string; // YYYY-MM-DD format
  company?: string;
  occupation?: string;
  status?: '신규' | '진행중' | '완료' | '보류';
}

export interface Task {
  id: string;
  customerId: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  completed: boolean;
  stage: 'lead' | 'prospect' | 'opportunity' | 'customer';
}

export interface Consultation {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  duration: string;
  summary: string;
  stage: 'lead' | 'prospect' | 'opportunity' | 'customer';
  transcript: string;
  aiInsights: {
    summary: string;
    keywords: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    nextSteps: string[];
  };
}

export interface VoiceSummary {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  duration: string;
  meetingType: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  nextMeetingDate?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  audioUrl?: string;
}

export interface Alert {
  id: string;
  type: 'birthday' | 'follow-up' | 'meeting' | 'contract' | 'overdue';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  customerId?: string;
  customerName?: string;
  dueDate: string;
  isRead: boolean;
  createdAt: string;
  badgeText: string;
  badgeColor: string;
  iconColor: string;
  bgColor: string;
}

export interface ScheduleEvent {
  id: string;
  customerId: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD format
  time: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  type: 'consultation' | 'follow-up' | 'contract' | 'claim' | 'renewal';
}

// 기존 타입들...

// 상담 분석 관련 타입들 추가
export interface ConsultSaveStage {
  stage_meta_id: number;
  stage_name: string;
}

export interface ConsultAnalysisData {
  summary: string;
  stages: {
    id: number;
    name: string;
    confidence: number;
  }[];
}

export interface ConsultAnalysisRequest {
  consult_text: string;
}

export interface ConsultAnalysisResponse {
  status: number;
  message: string;
  data: ConsultAnalysisData;
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
  data: {};
}

export interface ConsultListParams {
  customer_name?: string;
  start_date?: string;
  end_date?: string;
}

export interface ConsultListItem {
  id: number;
  customer_id: number;
  customer_name: string;
  consult_text: string;
  content_type: 'voice' | 'text';
  created_at: string;
  stages: ConsultSaveStage[];
}

export interface ConsultListResponse {
  status: number;
  message: string;
  data: {
    list: ConsultListItem[];
  };
}