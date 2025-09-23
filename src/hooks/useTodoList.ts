import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { todoAPI, TodoItem, apiUtils, TodoListParams } from '../lib/api';

export interface TodoListState {
  todos: TodoItem[];
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
}

export interface UseTodoListOptions {
  autoLoad?: boolean;
  defaultParams?: TodoListParams;
  onError?: (error: string) => void;
  onSuccess?: (todos: TodoItem[]) => void;
  pollingInterval?: number;
}

export function useTodoList(options: UseTodoListOptions = {}) {
  const {
    autoLoad = true,
    defaultParams = {},
    onError,
    onSuccess,
    pollingInterval
  } = options;

  // 상태 관리
  const [state, setState] = useState<TodoListState>({
    todos: [],
    isLoading: false,
    error: null,
    hasData: false
  });

  const [currentParams, setCurrentParams] = useState<TodoListParams>(defaultParams);

  // 콜백들을 ref로 관리하여 불필요한 재생성 방지
  const callbacksRef = useRef({
    onError,
    onSuccess
  });

  // 현재 요청을 추적하여 race condition 방지
  const currentRequestRef = useRef<Promise<TodoItem[]> | null>(null);
  const mountedRef = useRef(true);

  // 콜백 참조 업데이트
  useEffect(() => {
    callbacksRef.current = { onError, onSuccess };
  }, [onError, onSuccess]);

  // 컴포넌트 언마운트 추적
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Todo 목록 조회
  const loadTodos = useCallback(async (params?: TodoListParams) => {
    const finalParams = params || currentParams;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const requestPromise = apiUtils.withRetry(() => todoAPI.getTodoList(finalParams));
      currentRequestRef.current = requestPromise;
      
      const todos = await requestPromise;
      
      // 컴포넌트가 언마운트되었거나 새로운 요청이 시작된 경우 무시
      if (!mountedRef.current || currentRequestRef.current !== requestPromise) {
        return todos;
      }
      
      setState(prev => ({
        ...prev,
        todos,
        isLoading: false,
        hasData: true
      }));

      callbacksRef.current.onSuccess?.(todos);
      return todos;
    } catch (error) {
      if (!mountedRef.current) {
        return [];
      }

      const errorMessage = apiUtils.formatErrorMessage(error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      callbacksRef.current.onError?.(errorMessage);
      throw error;
    } finally {
      currentRequestRef.current = null;
    }
  }, [currentParams]);

  // 새로고침
  const refresh = useCallback(() => {
    return loadTodos();
  }, [loadTodos]);

  // 필터 파라미터 업데이트 (자동 reload는 useEffect에서 처리)
  const updateParams = useCallback((newParams: TodoListParams) => {
    setCurrentParams(prevParams => ({ ...prevParams, ...newParams }));
  }, []);

  // 특정 고객의 Todo만 조회
  const loadTodosByCustomer = useCallback((customerId: number, isCompleted?: boolean) => {
    const params: TodoListParams = { 
      customer_id: customerId,
      ...(isCompleted !== undefined && { is_completed: isCompleted })
    };
    
    setCurrentParams(params);
  }, []);

  // 완료되지 않은 Todo만 조회
  const loadIncompleteTodos = useCallback((customerId?: number) => {
    const params: TodoListParams = { 
      is_completed: false,
      ...(customerId && { customer_id: customerId })
    };
    
    setCurrentParams(params);
  }, []);

  // 완료된 Todo만 조회
  const loadCompletedTodos = useCallback((customerId?: number) => {
    const params: TodoListParams = { 
      is_completed: true,
      ...(customerId && { customer_id: customerId })
    };
    
    setCurrentParams(params);
  }, []);

  const toggleTodoComplete = useCallback(async (todoId: number) => {
  const todo = state.todos.find(t => t.id === todoId);
  if (!todo) return;

  // 낙관적 업데이트 (즉시 UI 반영)
  setState(prev => ({
    ...prev,
    todos: prev.todos.map(t => 
      t.id === todoId 
        ? { ...t, is_completed: !t.is_completed }
        : t
    )
  }));

  try {
    // API 호출 (서버에만 상태 전송)
    await todoAPI.toggleTodoComplete(todoId, !todo.is_completed);
    
    // 성공했지만 다시 불러오지 않음 (낙관적 업데이트 유지)
    if (import.meta.env.DEV) {
      console.log('Todo 상태 변경 성공:', todoId);
    }
    
  } catch (error) {
    if (!mountedRef.current) throw error;
    
    // 에러 발생 시에만 롤백
    setState(prev => ({
      ...prev,
      todos: prev.todos.map(t => 
        t.id === todoId 
          ? { ...t, is_completed: todo.is_completed }
          : t
      )
    }));
    
    const errorMessage = apiUtils.formatErrorMessage(error);
    setState(prev => ({ ...prev, error: errorMessage }));
    callbacksRef.current.onError?.(errorMessage);
    throw error;
  }
}, [state.todos]);

  // Todo 추가
  const addTodo = useCallback(async (todoData: Omit<TodoItem, 'id' | 'created_at'>) => {
    try {
      const newTodo = await todoAPI.createTodo(todoData);
      
      if (!mountedRef.current) return newTodo;
      
      setState(prev => ({
        ...prev,
        todos: [...prev.todos, newTodo]
      }));

      return newTodo;
    } catch (error) {
      if (!mountedRef.current) throw error;
      
      const errorMessage = apiUtils.formatErrorMessage(error);
      setState(prev => ({ ...prev, error: errorMessage }));
      callbacksRef.current.onError?.(errorMessage);
      throw error;
    }
  }, []);

  // Todo 삭제
  const removeTodo = useCallback(async (todoId: number) => {
    // 낙관적 업데이트
    const originalTodos = state.todos;
    setState(prev => ({
      ...prev,
      todos: prev.todos.filter(t => t.id !== todoId)
    }));

    try {
      await todoAPI.deleteTodo(todoId);
    } catch (error) {
      if (!mountedRef.current) throw error;
      
      // 에러 발생 시 롤백
      setState(prev => ({
        ...prev,
        todos: originalTodos
      }));
      
      const errorMessage = apiUtils.formatErrorMessage(error);
      setState(prev => ({ ...prev, error: errorMessage }));
      callbacksRef.current.onError?.(errorMessage);
      throw error;
    }
  }, [state.todos]);

  // 에러 클리어
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 통계 정보 계산 - useMemo로 최적화
  const stats = useMemo(() => {
    const todos = state.todos || [];
    const completed = todos.filter(t => t?.is_completed).length;
    const total = todos.length;

    return {
      total,
      completed,
      incomplete: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [state.todos]);

  const todayTodos = useMemo(() => {
    const today = new Date().toDateString();
    return (state.todos || []).filter(todo => {
      if (!todo?.due_date) return false;
      const dueDate = new Date(todo.due_date);
      return dueDate.toDateString() === today;
    });
  }, [state.todos]);

  const overdueTodos = useMemo(() => {
    const today = new Date();
    return (state.todos || []).filter(todo => {
      if (!todo?.due_date || todo.is_completed) return false;
      const dueDate = new Date(todo.due_date);
      return dueDate < today;
    });
  }, [state.todos]);
  // 초기 로딩
  useEffect(() => {
    if (autoLoad) {
      loadTodos();
    }
  }, [autoLoad, loadTodos]);

  // 폴링 설정
  useEffect(() => {
    if (!pollingInterval || pollingInterval <= 0) return;

    const interval = setInterval(() => {
      if (!state.isLoading && mountedRef.current) {
        loadTodos();
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [pollingInterval, state.isLoading, loadTodos]);

  return {
    // 상태
    ...state,
    currentParams,
    
    // 액션
    loadTodos,
    refresh,
    updateParams,
    loadTodosByCustomer,
    loadIncompleteTodos,
    loadCompletedTodos,
    toggleTodoComplete,
    addTodo,
    removeTodo,
    clearError,
    
    // 계산된 값들
    stats,
    todayTodos,
    overdueTodos,
    
    // 유틸리티
    isEmpty: state.todos.length === 0,
    hasError: !!state.error,
    hasIncompleteTodos: stats.incomplete > 0,
    hasOverdueTodos: overdueTodos.length > 0
  };
}