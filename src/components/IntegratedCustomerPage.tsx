import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Calendar, User, Tag, Clock, Mic, FileText, TrendingUp, Phone, Mail, Plus, ArrowRight, ChevronLeft, Edit, MoreVertical, CheckCircle, Circle, AlertCircle, CalendarDays, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import type { Page } from '../types';
import { consultAPI } from '../lib/api';

// 임시 타입 정의 (나중에 실제 타입으로 교체)
interface Customer {
  id: string;
  name: string;
  avatar: string;
  interestedProduct: string;
  stage: string;
  email: string;
  phone: string;
  lastContact: string;
  birthday?: string;
  voiceSummaries: Array<{
    id: string;
    meetingType: string;
    date: string;
    summary: string;
    sentiment: string;
    keyPoints: string[];
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: string;
    dueDate: string;
  }>;
  consultations: Array<{
    id: string;
    date: string;
    summary: string;
  }>;
  // API 데이터 추가
  consult_count?: number;
  action_count?: number;
  pending_count?: number;
}

// 상담 내역을 Customer 형식으로 변환하는 함수
const convertConsultListToCustomers = (consultList: any[]): Customer[] => {
  return consultList.map((consult, index) => ({
    id: String(index + 1),
    name: consult.customer_name,
    avatar: consult.customer_name.charAt(0),
    interestedProduct: '상담 진행 중',
    stage: 'customer',
    email: '',
    phone: '',
    lastContact: new Date().toISOString().split('T')[0],
    voiceSummaries: [{
      id: '1',
      meetingType: '상담',
      date: new Date().toISOString().split('T')[0],
      summary: consult.latest_voice || '상담 내용이 없습니다.',
      sentiment: 'neutral',
      keyPoints: []
    }],
    tasks: [],
    consultations: Array.from({ length: consult.consult_count || 0 }, (_, i) => ({
      id: String(i + 1),
      date: new Date().toISOString().split('T')[0],
      summary: `상담 ${i + 1}`
    })),
    consult_count: consult.consult_count,
    action_count: consult.action_count,
    pending_count: consult.pending_count
  }));
};

// 임시 mock 데이터 (fallback용)
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '김철수',
    avatar: '김',
    interestedProduct: '웹사이트 개발',
    stage: 'lead',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    lastContact: '2024-01-15',
    birthday: '1985-03-15',
    voiceSummaries: [
      {
        id: '1',
        meetingType: '초기 상담',
        date: '2024-01-15',
        summary: '웹사이트 리뉴얼에 대한 상담을 진행했습니다.',
        sentiment: 'positive',
        keyPoints: ['예산 200만원', '3월까지 완료 희망']
      }
    ],
    tasks: [
      {
        id: '1',
        title: '제안서 작성',
        description: '웹사이트 개발 제안서 작성',
        completed: false,
        priority: 'high',
        dueDate: '2024-01-20'
      }
    ],
    consultations: [
      {
        id: '1',
        date: '2024-01-15',
        summary: '초기 상담 진행'
      }
    ]
  },
  {
    id: '2',
    name: '이영희',
    avatar: '이',
    interestedProduct: '모바일 앱',
    stage: 'prospect',
    email: 'lee@example.com',
    phone: '010-2345-6789',
    lastContact: '2024-01-14',
    birthday: '1990-07-22',
    voiceSummaries: [
      {
        id: '2',
        meetingType: '요구사항 분석',
        date: '2024-01-14',
        summary: '모바일 앱 개발 요구사항을 분석했습니다.',
        sentiment: 'positive',
        keyPoints: ['iOS/Android 모두 필요', '6개월 개발 기간']
      }
    ],
    tasks: [
      {
        id: '2',
        title: '기술 검토',
        description: '모바일 앱 기술 스택 검토',
        completed: true,
        priority: 'medium',
        dueDate: '2024-01-18'
      }
    ],
    consultations: [
      {
        id: '2',
        date: '2024-01-14',
        summary: '요구사항 분석 미팅'
      }
    ]
  }
];

interface IntegratedCustomerPageProps {
  onNavigate: (page: Page) => void;
  onSelectCustomer?: (customerId: string) => void;
  onStartRecording?: (context: { type: 'task' | 'customer'; name: string; id: string }) => void;
  customers?: Customer[];
  isLoading?: boolean;
}

export function IntegratedCustomerPage({ 
  onNavigate, 
  onSelectCustomer, 
  onStartRecording,
  customers: propCustomers,
  isLoading = false
}: IntegratedCustomerPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  
  // 날짜 필터 상태
  const [dateFilterType, setDateFilterType] = useState<'all' | 'registration' | 'lastContact' | 'birthday' | 'custom'>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // API 관련 상태
  const [consultList, setConsultList] = useState<any[]>([]);
  const [isLoadingConsults, setIsLoadingConsults] = useState(false);
  const [consultError, setConsultError] = useState<string | null>(null);

  // 상담 내역 불러오기
  useEffect(() => {
    const fetchConsultList = async () => {
      setIsLoadingConsults(true);
      setConsultError(null);
      
      try {
        const params = {
          // 필터가 있다면 여기에 추가
          // customer_name: searchQuery,
          // start_date: startDate?.toISOString().split('T')[0],
          // end_date: endDate?.toISOString().split('T')[0]
        };
        
        const result = await consultAPI.getConsultList(params);
        setConsultList(result);
      } catch (error: any) {
        setConsultError(error.message);
        console.error('상담 내역 조회 실패:', error);
      } finally {
        setIsLoadingConsults(false);
      }
    };

    fetchConsultList();
  }, []); // 의존성 배열에 필터 조건들 추가 가능

  // 데이터 소스: props > API 데이터 > mock 데이터 순서로 우선순위
  const sourceCustomers = useMemo(() => {
    if (propCustomers) return propCustomers;
    if (consultList.length > 0) return convertConsultListToCustomers(consultList);
    return mockCustomers;
  }, [propCustomers, consultList]);

  // Create customer project data
  const customerProjects = useMemo(() => {
    return sourceCustomers.map(customer => {
      const totalActivities = customer.voiceSummaries.length + customer.consultations.length;
      const recentActivity = customer.voiceSummaries.length > 0 ? customer.voiceSummaries[0].date : customer.lastContact;
      const pendingTasks = customer.tasks.filter(t => !t.completed).length;
      const completedTasks = customer.tasks.filter(t => t.completed).length;
      
      return {
        ...customer,
        totalActivities,
        recentActivity,
        pendingTasks,
        completedTasks,
        sentiment: customer.voiceSummaries.length > 0 ? customer.voiceSummaries[0].sentiment : 'neutral'
      };
    });
  }, [sourceCustomers]);

  // Filter and search logic
  const filteredCustomers = useMemo(() => {
    let filtered = customerProjects;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.interestedProduct.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.voiceSummaries.some(vs => 
          vs.summary.toLowerCase().includes(query) ||
          vs.keyPoints.some(kp => kp.toLowerCase().includes(query))
        )
      );
    }

    if (stageFilter !== 'all') {
      filtered = filtered.filter(customer => customer.stage === stageFilter);
    }

    // 날짜 필터 적용
    if (dateFilterType !== 'all' && (startDate || endDate)) {
      filtered = filtered.filter(customer => {
        let targetDate: Date | null = null;
        
        switch (dateFilterType) {
          case 'registration':
            targetDate = new Date(customer.lastContact);
            break;
          case 'lastContact':
            targetDate = new Date(customer.lastContact);
            break;
          case 'birthday':
            if (customer.birthday) {
              targetDate = new Date(customer.birthday);
            }
            break;
          default:
            return true;
        }

        if (!targetDate) return false;

        const targetTime = targetDate.getTime();
        const startTime = startDate ? startDate.getTime() : 0;
        const endTime = endDate ? endDate.getTime() + (24 * 60 * 60 * 1000 - 1) : Infinity;

        return targetTime >= startTime && targetTime <= endTime;
      });
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.recentActivity).getTime() - new Date(a.recentActivity).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'activities':
        filtered.sort((a, b) => b.totalActivities - a.totalActivities);
        break;
      case 'stage':
        filtered.sort((a, b) => a.stage.localeCompare(b.stage));
        break;
    }

    return filtered;
  }, [customerProjects, searchQuery, stageFilter, sortBy, dateFilterType, startDate, endDate]);

  const selectedCustomer = selectedCustomerId ? customerProjects.find(c => c.id === selectedCustomerId) : null;

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'prospect': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'opportunity': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'customer': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStageName = (stage: string) => {
    switch (stage) {
      case 'lead': return '리드';
      case 'prospect': return '잠재고객';
      case 'opportunity': return '기회';
      case 'customer': return '고객';
      default: return stage;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setViewMode('detail');
  };

  // 날짜 필터 관련 함수들
  const resetDateFilter = () => {
    setDateFilterType('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getDateFilterLabel = () => {
    switch (dateFilterType) {
      case 'registration': return '등록일';
      case 'lastContact': return '마지막 연락일';
      case 'birthday': return '생일';
      default: return '날짜';
    }
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return '';
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`;
    }
    if (startDate) return `${startDate.toLocaleDateString()} 이후`;
    if (endDate) return `${endDate.toLocaleDateString()} 이전`;
    return '';
  };

  // 로딩 상태 처리
  if (isLoading || isLoadingConsults) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">상담 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (consultError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2">데이터 로딩 실패</h3>
          <p className="text-sm text-muted-foreground">{consultError}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 pb-safe md:pb-0 pt-safe">
      {/* Search and Filter Bar - Only show in overview mode */}
      {viewMode === 'overview' && (
        <div className="border-b border-border px-4 py-3 bg-muted/20">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-80">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="고객명, 상품, 키워드로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl bg-background"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-36 rounded-xl bg-background">
                  <SelectValue placeholder="단계 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 단계</SelectItem>
                  <SelectItem value="lead">리드</SelectItem>
                  <SelectItem value="prospect">잠재고객</SelectItem>
                  <SelectItem value="opportunity">기회</SelectItem>
                  <SelectItem value="customer">고객</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 날짜 필터 */}
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`w-44 rounded-xl justify-start text-left bg-background hover:bg-muted/50 ${
                      dateFilterType !== 'all' ? 'border-primary' : ''
                    }`}
                  >
                    <CalendarDays className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">
                      {dateFilterType !== 'all' ? `${getDateFilterLabel()}` : '날짜 필터'}
                    </span>
                    {dateFilterType !== 'all' && (
                      <X 
                        className="w-3 h-3 ml-1 shrink-0 hover:bg-muted rounded-sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          resetDateFilter();
                        }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">날짜 기준</label>
                      <Select value={dateFilterType} onValueChange={setDateFilterType}>
                        <SelectTrigger className="w-full rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체</SelectItem>
                          <SelectItem value="registration">등록일</SelectItem>
                          <SelectItem value="lastContact">마지막 연락일</SelectItem>
                          <SelectItem value="birthday">생일</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {dateFilterType !== 'all' && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">시작일</label>
                            <CalendarComponent
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              className="rounded-md border"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">종료일</label>
                            <CalendarComponent
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              className="rounded-md border"
                            />
                          </div>
                        </div>
                        {formatDateRange() && (
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded-lg">
                            선택된 범위: {formatDateRange()}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={resetDateFilter}
                            className="flex-1 rounded-xl"
                          >
                            초기화
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => setShowDatePicker(false)}
                            className="flex-1 rounded-xl"
                          >
                            적용
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 rounded-xl bg-background">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">최근 활동</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                  <SelectItem value="activities">활동 수</SelectItem>
                  <SelectItem value="stage">단계별</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'overview' ? (
          /* Overview Mode - Customer Cards */
          <div className="flex-1 min-h-0 h-full overflow-y-auto scroll-container scrollbar-styled p-4 pb-20 md:pb-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group" onClick={() => handleCustomerSelect(customer.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{customer.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{customer.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{customer.interestedProduct}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`rounded-full text-xs ${getStageColor(customer.stage)}`}>
                          {getStageName(customer.stage)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold">{customer.voiceSummaries.length}</div>
                          <div className="text-xs text-muted-foreground">음성 요약</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{customer.totalActivities}</div>
                          <div className="text-xs text-muted-foreground">총 활동</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{customer.pendingTasks}</div>
                          <div className="text-xs text-muted-foreground">대기 작업</div>
                        </div>
                      </div>

                      <Separator />

                      {customer.voiceSummaries.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mic className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">최근 음성 요약</span>
                            <Badge variant="outline" className={`text-xs ${getSentimentColor(customer.voiceSummaries[0].sentiment)}`}>
                              {customer.voiceSummaries[0].sentiment}
                            </Badge>
                          </div>
                          <div className="bg-muted rounded-lg p-3 border border-border/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">{customer.voiceSummaries[0].meetingType}</span>
                              <span className="text-xs text-muted-foreground">{customer.voiceSummaries[0].date}</span>
                            </div>
                            <p className="text-sm line-clamp-2">{customer.voiceSummaries[0].summary}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-xl"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleCustomerSelect(customer.id);
                          }}
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          관리
                        </Button>
                        {/* 기존 단순 녹음 버튼 대신 */}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="destructive"
      size="sm"
      className="rounded-xl"
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      <Plus className="w-4 h-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-44">
    <DropdownMenuItem
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onStartRecording?.({ type: 'customer', name: customer.name, id: customer.id });
      }}
    >
      <Mic className="w-4 h-4 mr-2" />
      녹음
    </DropdownMenuItem>
    <DropdownMenuItem
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('사진 촬영:', customer.name);
      }}
    >
      <Edit className="w-4 h-4 mr-2" />
      사진
    </DropdownMenuItem>
    <DropdownMenuItem
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('텍스트 입력:', customer.name);
      }}
    >
      <FileText className="w-4 h-4 mr-2" />
      텍스트
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
                  <p className="text-sm text-muted-foreground">다른 키워드로 검색하거나 필터를 조정해 보세요.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Detail Mode - Customer Project Management */
          selectedCustomer && (
            <div className="h-full flex">
              {/* Customer Info Sidebar */}
              <div className="w-80 border-r bg-muted/20 p-6 space-y-6">
                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('overview')}
                    className="mb-4 rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    목록으로
                  </Button>
                  
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarFallback>{selectedCustomer.avatar}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{selectedCustomer.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{selectedCustomer.interestedProduct}</p>
                  <Badge variant="outline" className={`rounded-full ${getStageColor(selectedCustomer.stage)}`}>
                    {getStageName(selectedCustomer.stage)}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">연락처 정보</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">프로젝트 현황</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-background rounded-lg p-3">
                        <div className="text-lg font-semibold">{selectedCustomer.voiceSummaries.length}</div>
                        <div className="text-xs text-muted-foreground">음성 요약</div>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <div className="text-lg font-semibold">{selectedCustomer.totalActivities}</div>
                        <div className="text-xs text-muted-foreground">총 활동</div>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <div className="text-lg font-semibold">{selectedCustomer.pendingTasks}</div>
                        <div className="text-xs text-muted-foreground">대기 작업</div>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <div className="text-lg font-semibold">{selectedCustomer.completedTasks}</div>
                        <div className="text-xs text-muted-foreground">완료 작업</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">빠른 작업</h3>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
                        <Calendar className="w-4 h-4 mr-2" />
                        미팅 일정 잡기
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
                        <FileText className="w-4 h-4 mr-2" />
                        제안서 작성
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start rounded-xl">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        진척 분석
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-6 overflow-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="grid w-full grid-cols-4 rounded-xl">
                    <TabsTrigger value="summary" className="rounded-lg">요약</TabsTrigger>
                    <TabsTrigger value="activities" className="rounded-lg">활동</TabsTrigger>
                    <TabsTrigger value="tasks" className="rounded-lg">작업</TabsTrigger>
                    <TabsTrigger value="notes" className="rounded-lg">노트</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Recent Voice Summaries */}
                      <Card className="rounded-2xl shadow-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Mic className="w-5 h-5 text-primary" />
                            최근 음성 요약
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedCustomer.voiceSummaries.slice(0, 3).map((summary) => (
                            <div key={summary.id} className="bg-muted/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{summary.meetingType}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={`text-xs ${getSentimentColor(summary.sentiment)}`}>
                                    {summary.sentiment}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{summary.date}</span>
                                </div>
                              </div>
                              <p className="text-sm mb-3">{summary.summary}</p>
                              {summary.keyPoints.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-muted-foreground">주요 포인트:</span>
                                  <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                                    {summary.keyPoints.slice(0, 2).map((point, index) => (
                                      <li key={index}>{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Recent Tasks */}
                      <Card className="rounded-2xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-primary" />
                            최근 작업
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {selectedCustomer.tasks.slice(0, 5).map((task) => (
                            <div key={task.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                              {task.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground mt-0.5" />
                              )}
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">{task.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="activities" className="mt-6">
                    <Card className="rounded-2xl">
                      <CardHeader>
                        <CardTitle>전체 활동 기록</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            ...selectedCustomer.voiceSummaries.map(vs => ({ ...vs, type: 'voice' })),
                            ...selectedCustomer.consultations.map(c => ({ ...c, type: 'consultation' }))
                          ]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 10)
                            .map((activity, index) => (
                              <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-start gap-4 p-4 border rounded-lg">
                                {activity.type === 'voice' ? (
                                  <Mic className="w-5 h-5 text-primary mt-1" />
                                ) : (
                                  <FileText className="w-5 h-5 text-blue-600 mt-1" />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium">
                                      {activity.type === 'voice' ? (activity as any).meetingType : '상담 기록'}
                                    </h4>
                                    <span className="text-sm text-muted-foreground">{activity.date}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{activity.summary}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tasks" className="mt-6">
                    <Card className="rounded-2xl">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>작업 관리</CardTitle>
                        <Button size="sm" className="rounded-lg">
                          <Plus className="w-4 h-4 mr-2" />
                          새 작업
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedCustomer.tasks.map((task) => (
                            <div key={task.id} className="flex items-start gap-3 p-4 border rounded-lg">
                              {task.completed ? (
                                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground mt-1" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                  </h4>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>수정</DropdownMenuItem>
                                      <DropdownMenuItem>완료 처리</DropdownMenuItem>
                                      <DropdownMenuItem>삭제</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">마감: {task.dueDate}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-6">
                    <Card className="rounded-2xl">
                      <CardHeader>
                        <CardTitle>프로젝트 노트</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="고객과의 미팅 내용, 중요한 정보, 후속 조치 사항 등을 기록하세요..."
                          className="min-h-32 rounded-xl"
                        />
                        <div className="flex justify-end mt-4">
                          <Button size="sm" className="rounded-lg">
                            노트 저장
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}