// utils/customerUtils.ts
import { Customer, VoiceSummary, Task, Consultation } from '../types/index';

// 유틸리티 함수들
export const getStageColor = (stage: string): string => {
  switch (stage) {
    case 'lead': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'prospect': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'opportunity': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'customer': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'positive': return 'text-green-600';
    case 'negative': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getStageName = (stage: string): string => {
  switch (stage) {
    case 'lead': return '리드';
    case 'prospect': return '잠재고객';
    case 'opportunity': return '기회';
    case 'customer': return '고객';
    default: return stage;
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return 'text-red-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

// API 데이터를 Customer 형식으로 변환
export const convertConsultListToCustomers = (consultList: any[]): Customer[] => {
  return consultList.map((consult, index) => ({
    id: String(index + 1),
    name: consult.customer_name,
    age: 0,
    email: '',
    phone: '',
    interestedProduct: '상담 진행 중',
    stage: 'customer' as const,
    lastContact: new Date().toISOString().split('T')[0],
    avatar: consult.customer_name.charAt(0),
    birthday: new Date().toISOString().split('T')[0],
    // 기존 Customer 인터페이스에 이미 있는 속성들이라면 추가
    totalActivities: 0,
    recentActivity: new Date().toISOString().split('T')[0],
    pendingTasks: 0,
    completedTasks: 0,
    sentiment: 'neutral' as const,
    voiceSummaries: [],
    tasks: [],
    consultations: [],
    consult_count: consult.consult_count,
    action_count: consult.action_count,
    pending_count: consult.pending_count
  }));
};

// Customer 데이터를 완전한 형태로 변환
export const createCustomerProjects = (customers: Customer[]): Customer[] => {
  return customers.map(customer => {
    const voiceSummaries: VoiceSummary[] = customer.consult_count ? [{
      id: '1',
      customerId: customer.id,
      customerName: customer.name,
      date: customer.lastContact,
      time: '14:00',
      duration: '30분',
      meetingType: '상담',
      summary: '상담 내용 요약',
      keyPoints: ['주요 포인트'],
      actionItems: ['액션 아이템'],
      sentiment: 'neutral' as const
    }] : [];

    const tasks: Task[] = customer.action_count ? [{
      id: '1',
      customerId: customer.id,
      title: '후속 조치',
      description: '고객 후속 상담',
      priority: 'medium' as const,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      stage: customer.stage
    }] : [];

    const consultations: Consultation[] = customer.consult_count ? Array.from({ length: customer.consult_count || 0 }, (_, i) => ({
      id: String(i + 1),
      customerId: customer.id,
      customerName: customer.name,
      date: customer.lastContact,
      time: '14:00',
      duration: '30분',
      summary: `상담 ${i + 1}`,
      stage: customer.stage,
      transcript: '상담 내용',
      aiInsights: {
        summary: '상담 요약',
        keywords: ['키워드'],
        sentiment: 'neutral' as const,
        nextSteps: ['다음 단계']
      }
    })) : [];

    return {
      ...customer,
      voiceSummaries,
      tasks,
      consultations,
      totalActivities: voiceSummaries.length + consultations.length,
      recentActivity: voiceSummaries.length > 0 ? voiceSummaries[0].date : customer.lastContact,
      pendingTasks: tasks.filter(t => !t.completed).length,
      completedTasks: tasks.filter(t => t.completed).length,
      sentiment: voiceSummaries.length > 0 ? voiceSummaries[0].sentiment : 'neutral' as const
    };
  });
};