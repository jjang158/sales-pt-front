// 📁 components/dashboard/utils/dashboardUtils.ts
import { TodoItem } from '../../lib/api';

export const transformTodoToScheduleEvent = (todo: TodoItem) => {
  if (!todo) return null;
  
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
    if (!dueDate) return '09:00';
    
    const date = new Date(dueDate);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    if (hours === 0 && minutes === 0) return '09:00';
    
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

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? '오후' : '오전';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${period} ${displayHour}:${minutes}`;
};

export const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isTodayOrFuture = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate >= today;
};

export const getPriorityBadgeColor = (priority: string) => {
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

export const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '높음';
    case 'medium': return '중간';
    case 'low': return '낮음';
    default: return '중간';
  }
};
