// Dashboard 하드코딩 데이터 분리

// 알림 타입 정의
export interface Alert {
  id: string;
  type: 'birthday' | 'follow-up' | 'contract';
  title: string;
  description: string;
  customerId: string;
  badgeText: string;
  iconColor: string;
  badgeColor: string;
  priority: 'high' | 'medium' | 'low';
}

// 영업 단계 데이터 타입 정의
export interface SalesStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
}

// 모의 알림 데이터
export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'birthday',
    title: '김민수님 생일',
    description: '내일이 생일입니다 - 축하 메시지 전송',
    customerId: '1',
    badgeText: '내일',
    iconColor: 'text-pink-600',
    badgeColor: 'bg-pink-100 text-pink-800',
    priority: 'medium' as const
  },
  {
    id: '2',
    type: 'follow-up',
    title: '보험 갱신 알림',
    description: '이지영님 종신보험 만료 예정',
    customerId: '2',
    badgeText: '3일 후',
    iconColor: 'text-orange-600',
    badgeColor: 'bg-orange-100 text-orange-800',
    priority: 'high' as const
  },
  {
    id: '3',
    type: 'contract',
    title: '계약 진행 현황',
    description: '박준혁님 자동차보험 청약서 검토 필요',
    customerId: '3',
    badgeText: '진행중',
    iconColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-800',
    priority: 'high' as const
  }
];

// 영업 단계별 현황 데이터
export const salesStageData: SalesStage[] = [
  {
    id: 'ta',
    name: 'TA(상담 약속 잡기)',
    count: 45,
    percentage: 22
  },
  {
    id: 'ap',
    name: 'AP(정보 수집)',
    count: 38,
    percentage: 18
  },
  {
    id: 'pt',
    name: 'PT(상품 제안)',
    count: 32,
    percentage: 16
  },
  {
    id: 'cl',
    name: 'CL(청약 제안)',
    count: 28,
    percentage: 14
  },
  {
    id: 'contract',
    name: '청약(출금 및 제출)',
    count: 24,
    percentage: 12
  },
  {
    id: 'delivery',
    name: '증권 전달(리뷰)',
    count: 19,
    percentage: 9
  }
];

// 우선순위별 뱃지 색상 매핑
export const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
  low: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
};

// 우선순위 텍스트 매핑
export const priorityTexts = {
  high: '높음',
  medium: '중간',
  low: '낮음'
};

// 알림 타입별 아이콘 배경색 매핑
export const alertIconColors = {
  birthday: 'bg-pink-100 dark:bg-pink-900/50',
  'follow-up': 'bg-orange-100 dark:bg-orange-900/50',
  contract: 'bg-gray-100 dark:bg-gray-900/50'
};