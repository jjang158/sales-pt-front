import React, { useState, useMemo } from 'react';
import { Calendar, CheckSquare, Mic, ChevronLeft, ChevronRight, Cake, Plus, Clock, Save, X, Edit, FileText } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import toast from 'react-hot-toast';
import { useTodoList } from '../hooks/useTodoList';
import { TodoItem } from '../lib/api';
import { AIInsightsWidget } from './features/AIInsightsWidget';
import type { Page } from '../types/index';


const mockAlerts = [
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

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
  onSelectCustomer: (customerId: string) => void;
  onStartRecording: (context: { type: 'task' | 'customer'; name: string; id: string }) => void;
}

// TodoItem을 스케줄 이벤트로 변환하는 함수
const transformTodoToScheduleEvent = (todo: TodoItem) => {
  // todo 객체 검증 추가
  if (!todo) {
    return null;
  }
  
  // 우선순위 매핑
  const getPriority = (todo: TodoItem): 'high' | 'medium' | 'low' => {
    if (todo.due_date) {
      const dueDate = new Date(todo.due_date);
      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) return 'high';
      if (diffDays <= 3) return 'medium';
      return 'low';
    }
    return 'medium';
  };

  const getTime = (dueDate: string) => {
    if (!dueDate) return '09:00';  // 안전장치 추가
    
    const date = new Date(dueDate);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    if (hours === 0 && minutes === 0) {
      return '09:00';
    }
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return {
    id: todo.id?.toString() || '',
    customerId: todo.customer_id?.toString() || '',
    title: todo.title || '',
    description: todo.description || '',
    date: todo.due_date || '',
    time: getTime(todo.due_date),
    priority: getPriority(todo),
    status: todo.is_completed ? 'completed' as const : 'pending' as const,
    type: 'consultation' as const,
    customerName: todo.customer_name || ''
  };
};
export function DashboardPage({ onNavigate, onSelectCustomer, onStartRecording }: DashboardPageProps) {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState({
    id: '',
    title: '',
    description: '',
    time: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    customerName: ''
  });

  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  // TodoAPI 사용
  const {
    todos,
    isLoading,
    error,
    stats,
    todayTodos,
    overdueTodos,
    toggleTodoComplete,
    addTodo,
    clearError
  } = useTodoList({
    autoLoad: true,
    //defaultParams: { customer_id: 101 },
    onError: (error) => {
      console.warn('Todo 로딩 중 문제 발생:', error);
      // 에러를 조용히 처리하고 기본 데이터로 진행
    }
  });

  // 선택된 날짜의 todos 필터링
  // scheduleEvents 생성 부분 수정
const scheduleEvents = useMemo(() => {
  if (!todos || !Array.isArray(todos)) {
    return [];
  }
  
  return todos
    .filter(todo => {
      if (!todo || !todo.due_date) return false;
      const todoDate = new Date(todo.due_date);
      return todoDate.toDateString() === selectedDate.toDateString();
    })
    .map(transformTodoToScheduleEvent)
    .filter((event): event is NonNullable<typeof event> => event !== null) // null 제거
    .slice(0, 8);
}, [todos, selectedDate]);

  const upcomingBirthdays = useMemo(() => {
  const today = new Date();
  const upcoming: Array<{
    id: string;
    name: string;
    birthday: string;
    daysUntil: number;
    isToday: boolean;
  }> = [];
  
  return upcoming.slice(0, 4);
}, []);

  const handleToggleComplete = async (todoId: number) => {
  try {
    const currentTodo = todos.find(t => t.id === todoId);
    if (!currentTodo) {
      console.error('Todo를 찾을 수 없습니다:', todoId);
      return;
    }
    
    const newCompletedStatus = !currentTodo.is_completed;
    await toggleTodoComplete(todoId);
    
    // Toast 알림
    if (newCompletedStatus) {
      toast.success('할 일이 완료되었습니다!');
    } else {
      toast.success('할 일이 미완료로 변경되었습니다!');
    }
    
  } catch (error) {
    console.error('Todo 상태 변경 실패:', error);
    toast.error('상태 변경에 실패했습니다.');
  }
};
  const handleStageClick = (type: string) => {
  setSelectedStage(type);
  setShowTaskModal(true);
};

  // 날짜 관련 함수들 (기존 유지)
  function formatDate(date: Date) {
    if (isMobile) {
      const dateStr = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\./g, '-').replace(/\s/g, '').replace(/-$/, '');
      const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' });
      return `${dateStr}(${weekday})`;
    }
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? '오후' : '오전';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${period} ${displayHour}:${minutes}`;
  };

  const changeDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarDate(date);
      setShowCalendar(false);
    }
  };

  const isToday = (date: Date) => {
  const today = new Date(); // 현재 날짜를 가져옴
  return date.toDateString() === today.toDateString();
};

const isTodayOrFuture = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate >= today;
};

  const handleEditEvent = (eventData: any) => {
    setEditingEvent(eventData);
    setShowEditModal(true);
  };

  const handleSaveEvent = () => {
    console.log('일정 저장:', editingEvent);
    setShowEditModal(false);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingEvent({
      id: '',
      title: '',
      description: '',
      time: '',
      priority: 'medium',
      customerName: ''
    });
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '중간';
      case 'low': return '낮음';
      default: return '중간';
    }
  };

  // 에러 표시
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <h3 className="text-lg font-medium">데이터 로딩 실패</h3>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <Button onClick={clearError} className="rounded-xl">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-auto scrollbar-styled relative`}>
      {/* 네비게이션 연결 효과 - 데스크톱만 */}
      {!isMobile && (
        <>
          <div className="absolute left-0 top-8 w-3 h-12 bg-gradient-to-r from-green-500/30 to-transparent rounded-r-full animate-pulse" />
          <div className="absolute left-1 top-10 w-2 h-8 bg-gradient-to-r from-orange-400/50 to-transparent rounded-r-full" />
        </>
      )}
      <div className={`${isMobile ? 'pt-6 pb-6 px-4' : 'pt-4 pb-6 px-6'}`}>

        {/* Main Content with Side Panels - 70:30 비율로 변경 */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4 -mt-4' : 'gap-6 -mt-8'}`} style={!isMobile ? { gridTemplateColumns: '7fr 3fr' } : {}}>

          {/* Left Column - 업무진행현황 + 업무리스트 (70% - 7/10) */}
          <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            {/* 업무 진행 현황 */}
            <Card className={`rounded-2xl shadow-lg border-border/50 dark:border-border/20 dark:bg-card/50 relative overflow-hidden ${isMobile ? 'mobile-card-compact' : ''}`}>
              {/* 카드 연결 효과 */}
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-green-500 via-green-600 to-green-700 rounded-r-sm" />
              <div className="absolute left-0 top-4 w-3 h-3 bg-orange-400 rounded-full shadow-lg animate-pulse" />
              <CardHeader className="!pt-1 !pb-1">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5" />
                  업무 진행 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className={`grid gap-6 ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {/* DO (할 일) */}
                  <button
                    className={`${isMobile ? '' : 'text-left'} bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer group ${isMobile ? 'p-2.5' : 'p-6'}`}
                    onClick={() => handleStageClick('DO')}
                  >
                    <div className={`flex items-center ${isMobile ? 'justify-center gap-2 mb-1' : 'justify-between mb-4'}`}>
                      <div className={`${isMobile ? 'w-7 h-7' : 'w-10 h-10'} bg-orange-500 rounded-full flex items-center justify-center`}>
                        <Clock className={`${isMobile ? 'w-3.5 h-3.5' : 'w-5 h-5'} text-white`} />
                      </div>
                      <div className={isMobile ? 'text-center' : 'text-right'}>
                        <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-orange-700 dark:text-orange-400`}>
                          {stats.incomplete}
                        </p>
                        <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-orange-600 dark:text-orange-500`}>개</p>
                      </div>
                    </div>
                    <div className={isMobile ? 'text-center' : ''}>
                      <h3 className={`font-semibold text-orange-800 dark:text-orange-300 ${isMobile ? 'text-xs' : 'mb-1 text-lg'}`}>할 일 (DO)</h3>
                      {!isMobile && (
                        <p className="text-base text-orange-600 dark:text-orange-400">
                          진행해야 할 업무들
                        </p>
                      )}
                    </div>
                  </button>

                  {/* DONE (완료) */}
                  <button
                    className={`${isMobile ? '' : 'text-left'} bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer group ${isMobile ? 'p-2.5' : 'p-6'}`}
                    onClick={() => handleStageClick('DONE')}
                  >
                    <div className={`flex items-center ${isMobile ? 'justify-center gap-2 mb-1' : 'justify-between mb-4'}`}>
                      <div className={`${isMobile ? 'w-7 h-7' : 'w-10 h-10'} bg-green-500 rounded-full flex items-center justify-center`}>
                        <CheckSquare className={`${isMobile ? 'w-3.5 h-3.5' : 'w-5 h-5'} text-white`} />
                      </div>
                      <div className={isMobile ? 'text-center' : 'text-right'}>
                        <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-700 dark:text-green-400`}>
                          {stats.completed}
                        </p>
                        <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-green-600 dark:text-green-500`}>개</p>
                      </div>
                    </div>
                    <div className={isMobile ? 'text-center' : ''}>
                      <h3 className={`font-semibold text-green-800 dark:text-green-300 ${isMobile ? 'text-xs' : 'mb-1 text-lg'}`}>완료 (DONE)</h3>
                      {!isMobile && (
                        <p className="text-base text-green-600 dark:text-green-400">
                          완료된 업무들
                        </p>
                      )}
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* 업무 리스트 */}
            <Card className={`rounded-2xl shadow-lg relative border-border/50 dark:border-border/20 dark:bg-card/50 overflow-visible ${isMobile ? 'mobile-card-compact' : ''}`}>
              {/* 카드 연결 효과 */}
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 rounded-r-sm" />
              <div className="absolute left-0 top-4 w-3 h-3 bg-blue-400 rounded-full shadow-lg animate-pulse" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {isMobile ? `업무 (${scheduleEvents.length})` : `업무 리스트 (${scheduleEvents.length})`}
                  </CardTitle>

                  <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
                    <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changeDate('prev')}
                        className="rounded-xl"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <div className={`text-center ${isMobile ? 'min-w-[140px]' : 'min-w-[180px]'}`}>
                        <p className={`${isMobile ? 'text-xs font-medium' : 'text-sm'}`}>{formatDate(selectedDate)}</p>
                        {isToday(selectedDate) && (
                          <p className="text-xs text-primary font-medium">오늘</p>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changeDate('next')}
                        className="rounded-xl"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>

                      {!isMobile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDate(new Date())} // 현재 날짜로 설정
                          className="rounded-xl text-xs"
                          disabled={isToday(selectedDate)}
                        >
                          오늘로
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCalendar(true)}
                        className="rounded-xl"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        {!isMobile && '달력'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={`space-y-3 overflow-y-auto scrollbar-styled ${isMobile ? 'mobile-card-content' : 'max-h-96'}`}>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">할 일을 불러오는 중...</p>
                  </div>
                ) : scheduleEvents.length > 0 ? (
                  scheduleEvents.map((event) => {
                    const todo = todos.find(t => t.id.toString() === event.id);
                    if (!todo) return null;

                    return (
                      <div
                        key={event.id}
                        className={`flex ${isMobile ? 'items-start' : 'items-center'} gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group`}
                      >
                        <div className={isMobile ? 'pt-0.5' : ''}>
                          <Checkbox
                            className="w-5 h-5"
                            checked={todo.is_completed}
                            onCheckedChange={() => handleToggleComplete(todo.id)}
                          />
                        </div>

                        <div className="flex-1 cursor-pointer hover:bg-muted/30 p-2 rounded-lg transition-colors"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleEditEvent({
                                 id: event.id,
                                 title: event.title,
                                 description: event.description,
                                 time: event.time,
                                 priority: event.priority,
                                 customerName: event.customerName
                               });
                             }}>
                          <div className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center gap-2'} mb-1`}>
                            <h4 className={`font-medium ${isMobile ? 'text-xs leading-snug' : 'text-lg'} ${todo.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                              {event.title}
                            </h4>
                            <div className={`flex gap-1 ${isMobile ? '' : 'items-center'}`}>
                              <Badge variant="outline" className={`rounded-full ${isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-sm px-2 py-1'} ${getPriorityBadgeColor(event.priority)}`}>
                                {getPriorityText(event.priority)}
                              </Badge>
                              {todo.is_completed && (
                                <Badge variant="secondary" className={`rounded-full ${isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-sm px-2 py-1'}`}>
                                  완료
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className={`${isMobile ? 'text-[11px] leading-relaxed' : 'text-base'} text-muted-foreground`}>{event.description}</p>
                          <div className={`flex items-center gap-2 ${isMobile ? 'text-[10px] mt-1' : 'text-sm'} text-muted-foreground`}>
                            <span>{formatTime(event.time)}</span>
                            <span>•</span>
                            <span>{event.customerName}</span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="rounded-full p-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                            >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              onStartRecording({
                              type: 'customer',
                              name: event.customerName,
                              id: event.customerId
                            });
                          }}
                         >
                         <Mic className="w-4 h-4 mr-2" />
                           녹음
                        </DropdownMenuItem>
                         <DropdownMenuItem
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              console.log('사진 촬영/필기인식:', event.customerName);
                             // TODO: 사진 촬영 기능 구현
                            }}
                          >
                          <Edit className="w-4 h-4 mr-2" />
                             사진
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              console.log('텍스트 입력:', event.customerName);
                              // TODO: 텍스트 입력 모달 열기
                            }}
                          >
                          <FileText className="w-4 h-4 mr-2" />
                             텍스트
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>선택한 날짜에 예정된 할 일이 없습니다</p>
                    <p className="text-xs mt-1">새로운 할 일을 추가해보세요</p>
                  </div>
                )}
              </CardContent>

              {/* Floating Add Todo Button - Exact format as requested */}
              <button
                data-slot="button"
                className="inline-flex items-center justify-center 
                           whitespace-nowrap text-sm font-medium 
                           disabled:pointer-events-none disabled:opacity-50
                           [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 
                           shrink-0 [&_svg]:shrink-0 
                           outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] 
                           aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive 
                           text-foreground hover:bg-accent hover:text-accent-foreground 
                           dark:bg-input/30 dark:border-input dark:hover:bg-input/50 
                           gap-1.5 has-[>svg]:px-2.5 
                           absolute bottom-4 right-4 
                           w-10 h-10 
                           rounded-full p-0 
                           shadow-lg hover:shadow-xl transition-shadow 
                           z-10 
                           bg-background border-2"
                title="새 할 일 추가"
                disabled={!isTodayOrFuture(selectedDate)}
                onClick={() => {
                  if (isTodayOrFuture(selectedDate)) {
                    console.log('새 할 일 추가 - 날짜:', selectedDate);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-4 h-4">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              </button>
            </Card>
          </div>

          {/* Right Column - 영업단계별현황 + AI추천 + 중요알림 (30% - 3/10) */}
          <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            {/* 영업 단계별 현황 */}
            <Card className={`rounded-2xl shadow-lg border-border/50 dark:border-border/20 dark:bg-card/50 ${isMobile ? 'mobile-card-small' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  영업 단계별 현황
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${isMobile ? 'mobile-card-content-small' : ''}`}>
                {/* 신규문의 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">TA(상담 약속 잡기)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">45번</span>
                      <span className="text-sm font-semibold">22%</span>
                    </div>
                  </div>
                  <Progress value={22} className="h-2" />
                </div>

                {/* 상담예약 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AP(정보 수집)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">38번</span>
                      <span className="text-sm font-semibold">18%</span>
                    </div>
                  </div>
                  <Progress value={18} className="h-2" />
                </div>

                {/* 상담진행 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PT(상품 제안)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">32번</span>
                      <span className="text-sm font-semibold">16%</span>
                    </div>
                  </div>
                  <Progress value={16} className="h-2" />
                </div>

                {/* 견적제시 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CL(청약 제안)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">28번</span>
                      <span className="text-sm font-semibold">14%</span>
                    </div>
                  </div>
                  <Progress value={14} className="h-2" />
                </div>

                {/* 상품제안 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">청약(출금 및 제출)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">24번</span>
                      <span className="text-sm font-semibold">12%</span>
                    </div>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>

                {/* 계약성공 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">증권 전달(리뷰)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">19번</span>
                      <span className="text-sm font-semibold">9%</span>
                    </div>
                  </div>
                  <Progress value={9} className="h-2" />
                </div>

              </CardContent>
            </Card>

            {/* AI 영업 도우미 */}
            <AIInsightsWidget
              overdueTodos={overdueTodos}
              isMobile={isMobile}
            />

            {/* 중요 알림 */}
            <Card className={`rounded-2xl shadow-lg border-border/50 dark:border-border/20 dark:bg-card/50 ${isMobile ? 'mobile-card-small' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  중요 알림
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-3 ${isMobile ? 'mobile-card-content-small' : ''}`}>
                {mockAlerts.map((alert) => {
                  const getAlertIcon = (type: string) => {
                    switch (type) {
                      case 'birthday':
                        return <Cake className={`w-4 h-4 ${alert.iconColor}`} />;
                      case 'follow-up':
                        return <Clock className={`w-4 h-4 ${alert.iconColor}`} />;
                      default:
                        return <CheckSquare className={`w-4 h-4 ${alert.iconColor}`} />;
                    }
                  };

                  const getIconBgColor = (type: string) => {
                    switch (type) {
                      case 'birthday':
                        return 'bg-pink-100 dark:bg-pink-900/50';
                      case 'follow-up':
                        return 'bg-orange-100 dark:bg-orange-900/50';
                      default:
                        return 'bg-gray-100 dark:bg-gray-900/50';
                    }
                  };

                  return (
                    <div
                      key={alert.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => alert.customerId && onSelectCustomer(alert.customerId)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconBgColor(alert.type)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.description}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${alert.badgeColor}`}>
                        {alert.badgeText}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>날짜 선택</DialogTitle>
            <DialogDescription>
              확인하고 싶은 날짜를 선택해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <CalendarComponent
              mode="single"
              selected={calendarDate}
              onSelect={handleDateSelect}
              className="rounded-xl border"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Event Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>할 일 수정</DialogTitle>
            <DialogDescription>
              할 일 정보를 수정하세요.
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-4 px-6 pb-6 space-y-0">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={editingEvent.title}
                onChange={(e) => setEditingEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="할 일 제목을 입력하세요"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={editingEvent.description}
                onChange={(e) => setEditingEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="상세 설명을 입력하세요"
                rows={3}
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">시간</Label>
              <Input
                id="time"
                type="time"
                value={editingEvent.time}
                onChange={(e) => setEditingEvent(prev => ({ ...prev, time: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">우선순위</Label>
              <Select 
                value={editingEvent.priority} 
                onValueChange={(value : string) => setEditingEvent(prev => ({ ...prev, priority: value as 'high' | 'medium' | 'low' }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="우선순위 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">높음</SelectItem>
                  <SelectItem value="medium">중간</SelectItem>
                  <SelectItem value="low">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerName">고객명</Label>
              <Input
                id="customerName"
                value={editingEvent.customerName}
                onChange={(e) => setEditingEvent(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="고객명을 입력하세요"
                className="rounded-xl"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal} className="rounded-xl">
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button onClick={handleSaveEvent} className="rounded-xl">
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}