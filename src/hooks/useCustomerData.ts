// hooks/useCustomerData.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { consultAPI, apiUtils } from '../lib/api';
import { Customer } from '../types/index';
import { convertConsultListToCustomers } from './../utils/customerUtils';

export interface CustomerDataState {
  consultList: any[];
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
}

export interface UseCustomerDataOptions {
  autoLoad?: boolean;
  onSuccess?: (customers: Customer[]) => void;
  onError?: (error: string) => void;
}

export function useCustomerData(options: UseCustomerDataOptions = {}) {
  const { autoLoad = true, onSuccess, onError } = options;

  const [state, setState] = useState<CustomerDataState>({
    consultList: [],
    customers: [],
    isLoading: false,
    error: null,
    hasData: false
  });

  const callbacksRef = useRef({ onSuccess, onError });
  const mountedRef = useRef(true);
  const currentRequestRef = useRef<Promise<any[]> | null>(null);

  useEffect(() => {
    callbacksRef.current = { onSuccess, onError };
  }, [onSuccess, onError]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadCustomerData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const requestPromise = apiUtils.withRetry(() => 
        consultAPI.getConsultList({})
      );
      currentRequestRef.current = requestPromise;

      const consultList = await requestPromise;

      if (!mountedRef.current || currentRequestRef.current !== requestPromise) {
        return consultList;
      }

      const customers = convertConsultListToCustomers(consultList);

      setState(prev => ({
        ...prev,
        consultList,
        customers,
        isLoading: false,
        hasData: true
      }));

      callbacksRef.current.onSuccess?.(customers);
      return customers;
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
  }, []);

  const refresh = useCallback(() => {
    return loadCustomerData();
  }, [loadCustomerData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadCustomerData();
    }
  }, [autoLoad, loadCustomerData]);

  return {
    ...state,
    loadCustomerData,
    refresh,
    clearError,
    hasError: !!state.error,
    isEmpty: state.customers.length === 0
  };
}