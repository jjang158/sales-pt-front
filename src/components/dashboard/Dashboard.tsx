import React, { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { useTodoList } from '../../hooks/useTodoList';
import { transformTodoToScheduleEvent } from './dashboardUtils';
import { WorkProgressCard } from './WorkProgressCard';
import { TaskListCard } from './TaskListCard';
import { SalesStageCard } from './SalesStageCard';
import { AIRecommendationCard } from './AIRecommendationCard';
import { ImportantAlertsCard } from './ImportantAlertsCard';
import { CalendarModal } from './CalendarModal';
import { EditEventModal } from './EditEventModal';
import { ErrorDisplay } from './ErrorDisplay';
import { mockAlerts } from './mockData';
import type { Page } from '../../types/index';

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
  onSelectCustomer: (customerId: string) => void;
  onStartRecording: (context: { type: 'task' | 'customer'; name: string; id: string }) => void;
}

export function DashboardPage({ onNavigate, onSelectCustomer, onStartRecording }: DashboardPageProps) {
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{
  id: string;
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  customerName: string;
}>({
  id: '', title: '', description: '', time: '', priority: 'medium', customerName: ''
});
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // API hooks
  const {
    todos, isLoading, error, stats, todayTodos, overdueTodos,
    toggleTodoComplete, addTodo, clearError
  } = useTodoList({
    autoLoad: true,
    onError: (error) => console.error('Todo 로딩 에러:', error)
  });

  // Computed values
  const scheduleEvents = useMemo(() => {
    if (!todos || !Array.isArray(todos)) return [];
    
    return todos
      .filter(todo => {
        if (!todo?.due_date) return false;
        const todoDate = new Date(todo.due_date);
        return todoDate.toDateString() === selectedDate.toDateString();
      })
      .map(transformTodoToScheduleEvent)
      .filter(Boolean)
      .slice(0, 8);
  }, [todos, selectedDate]);

  // Event handlers
  const handleStageClick = (type: string) => {
    setSelectedStage(type);
    setShowTaskModal(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarDate(date);
      setShowCalendar(false);
    }
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
    id: '', title: '', description: '', time: '', priority: 'medium' as 'high' | 'medium' | 'low', customerName: ''
  });
};

  // Error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={clearError} />;
  }

  return (
    <div className="h-full overflow-auto scrollbar-styled bg-gray-50/50">
      <div className="pt-4 px-6 pb-6">
        <div className="grid gap-6 -mt-8" style={{ gridTemplateColumns: '7fr 3fr' }}>
          
          {/* Left Column */}
          <div className="space-y-6">
            <WorkProgressCard stats={stats} onStageClick={handleStageClick} />
            <TaskListCard
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              scheduleEvents={scheduleEvents}
              todos={todos}
              isLoading={isLoading}
              onToggleComplete={toggleTodoComplete}
              onEditEvent={handleEditEvent}
              onStartRecording={onStartRecording}
              onShowCalendar={() => setShowCalendar(true)}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <SalesStageCard />
            <AIRecommendationCard overdueTodos={overdueTodos} />
            <ImportantAlertsCard alerts={mockAlerts} onSelectCustomer={onSelectCustomer} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CalendarModal
        open={showCalendar}
        onOpenChange={setShowCalendar}
        calendarDate={calendarDate}
        onDateSelect={handleDateSelect}
      />
      
      <EditEventModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
        onSave={handleSaveEvent}
        onClose={handleCloseModal}
      />
    </div>
  );
}
