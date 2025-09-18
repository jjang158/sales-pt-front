// components/customer/dashboard/CustomerDashboard.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { CustomerFilters } from './CustomerFilters';
import { CustomerOverview } from './CustomerOverview';
import { useCustomerFilters } from '../../../hooks/useCustomerFilters';
import { createCustomerProjects, convertConsultListToCustomers } from '../../../utils/customerUtils';
import { RecordingContext, Page, Customer, CustomerFilters as CustomerFiltersType } from '../../../types/index';
import { consultAPI } from '../../../lib/api';

// Mock 데이터 (fallback용)
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '김철수',
    age: 35,
    email: 'kim@example.com',
    phone: '010-1234-5678',
    interestedProduct: '웹사이트 개발',
    stage: 'lead',
    lastContact: '2024-01-15',
    avatar: '김',
    birthday: '1985-03-15',
    // 추가 속성들
    totalActivities: 0,
    recentActivity: '2024-01-15',
    pendingTasks: 0,
    completedTasks: 0,
    sentiment: 'neutral',
    voiceSummaries: [],
    tasks: [],
    consultations: [],
    consult_count: 0,
    action_count: 0,
    pending_count: 0
  },
  {
    id: '2',
    name: '이영희',
    age: 28,
    email: 'lee@example.com',
    phone: '010-2345-6789',
    interestedProduct: '모바일 앱',
    stage: 'prospect',
    lastContact: '2024-01-14',
    avatar: '이',
    birthday: '1990-07-22',
    // 추가 속성들
    totalActivities: 0,
    recentActivity: '2024-01-14',
    pendingTasks: 0,
    completedTasks: 0,
    sentiment: 'neutral',
    voiceSummaries: [],
    tasks: [],
    consultations: [],
    consult_count: 0,
    action_count: 0,
    pending_count: 0
  }
];

interface CustomerDashboardProps {
  onNavigate: (page: Page) => void;
  onSelectCustomer?: (customerId: string) => void;
  onStartRecording?: (context: RecordingContext) => void;
}

export function CustomerDashboard({ 
  onNavigate, 
  onSelectCustomer, 
  onStartRecording 
}: CustomerDashboardProps) {
  // API 관련 상태 (기존 IntegratedCustomerPage에서 복사)
  const [consultList, setConsultList] = useState<any[]>([]);
  const [isLoadingConsults, setIsLoadingConsults] = useState(false);
  const [consultError, setConsultError] = useState<string | null>(null);

  // 상담 내역 불러오기 (기존 코드에서 복사)
  useEffect(() => {
    const fetchConsultList = async () => {
      setIsLoadingConsults(true);
      setConsultError(null);
      
      try {
        const result = await consultAPI.getConsultList({});
        setConsultList(result);
      } catch (error: any) {
        setConsultError(error.message);
        console.error('상담 내역 조회 실패:', error);
      } finally {
        setIsLoadingConsults(false);
      }
    };

    fetchConsultList();
  }, []);

  const [filters, setFilters] = useState<CustomerFiltersType>({
    searchQuery: '',
    stageFilter: 'all',
    sortBy: 'recent',
    dateFilter: {
      type: 'all',
      startDate: undefined,
      endDate: undefined
    }
  });

  // 데이터 소스: API 데이터 > mock 데이터 순서로 우선순위
  const sourceCustomers = useMemo(() => {
    if (consultList.length > 0) return convertConsultListToCustomers(consultList);
    return mockCustomers;
  }, [consultList]);

  // Customer 데이터를 완전한 형태로 변환
  const customerProjects = useMemo(() => {
    return createCustomerProjects(sourceCustomers);
  }, [sourceCustomers]);

  // 필터링된 고객 목록
  const filteredCustomers = useCustomerFilters(customerProjects, filters);

  const handleFiltersChange = (newFilters: Partial<CustomerFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleCustomerSelect = (customerId: string) => {
    onSelectCustomer?.(customerId);
  };

  // 로딩 상태
  if (isLoadingConsults) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">상담 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (consultError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2">데이터 로딩 실패</h3>
          <p className="text-sm text-muted-foreground">{consultError}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <CustomerFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
      
      <CustomerOverview 
        customers={filteredCustomers}
        onSelectCustomer={handleCustomerSelect}
        onStartRecording={onStartRecording}
      />
    </div>
  );
}