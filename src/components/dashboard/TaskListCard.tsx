import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, Edit, FileText, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { 
  formatDate, formatTime, isToday, isTodayOrFuture, 
  getPriorityBadgeColor, getPriorityText 
} from './dashboardUtils';
import toast from 'react-hot-toast';

interface TaskListCardProps {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  scheduleEvents: any[];
  todos: any[];
  isLoading: boolean;
  onToggleComplete: (todoId: number) => Promise<void>;
  onEditEvent: (eventData: any) => void;
  onStartRecording: (context: any) => void;
  onShowCalendar: () => void;
}

export function TaskListCard({
  selectedDate, setSelectedDate, scheduleEvents, todos, isLoading,
  onToggleComplete, onEditEvent, onStartRecording, onShowCalendar
}: TaskListCardProps) {
  
  const changeDate = (direction: 'prev' | 'next') => {
  setSelectedDate((prev: Date) => {  // prev의 타입을 Date로 명시
    const newDate = new Date(prev);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    return newDate;
  });
};

  const handleToggleComplete = async (todoId: number) => {
    try {
      const currentTodo = todos.find(t => t.id === todoId);
      if (!currentTodo) {
        console.error('Todo를 찾을 수 없습니다:', todoId);
        return;
      }
      
      const newCompletedStatus = !currentTodo.is_completed;
      await onToggleComplete(todoId);
      
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

  return (
    <Card className="rounded-2xl shadow-lg relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            업무 리스트 ({scheduleEvents.length})
          </CardTitle>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeDate('prev')}
                className="rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="text-center min-w-[180px]">
                <p className="text-sm">{formatDate(selectedDate)}</p>
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

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="rounded-xl text-xs"
                disabled={isToday(selectedDate)}
              >
                오늘로
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onShowCalendar}
                className="rounded-xl"
              >
                <Calendar className="w-4 h-4 mr-1" />
                달력
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 max-h-96 overflow-y-auto scrollbar-styled">
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
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <Checkbox
                  className="w-5 h-5"
                  checked={todo.is_completed}
                  onCheckedChange={() => handleToggleComplete(todo.id)}
                />

                <div className="flex-1 cursor-pointer hover:bg-muted/30 p-2 rounded-lg transition-colors"
                     onClick={(e) => {
                       e.stopPropagation();
                       onEditEvent({
                         id: event.id,
                         title: event.title,
                         description: event.description,
                         time: event.time,
                         priority: event.priority,
                         customerName: event.customerName
                       });
                     }}>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${todo.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                      {event.title}
                    </h4>
                    <Badge variant="outline" className={`rounded-full text-xs ${getPriorityBadgeColor(event.priority)}`}>
                      {getPriorityText(event.priority)}
                    </Badge>
                    {todo.is_completed && (
                      <Badge variant="secondary" className="rounded-full text-xs">
                        완료
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      사진
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        console.log('텍스트 입력:', event.customerName);
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

      {/* Floating Add Todo Button */}
      <Button
        variant="outline"
        size="sm"
        className={`absolute bottom-4 right-4 w-10 h-10 rounded-full p-0 shadow-lg hover:shadow-xl transition-shadow z-10 bg-background border-2 ${
          !isTodayOrFuture(selectedDate) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={!isTodayOrFuture(selectedDate)}
        onClick={() => {
          if (isTodayOrFuture(selectedDate)) {
            console.log('새 할 일 추가 - 날짜:', selectedDate);
          }
        }}
        title={!isTodayOrFuture(selectedDate) ? '과거 날짜에는 할 일을 추가할 수 없습니다' : '새 할 일 추가'}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </Card>
  );
}
