// hooks/useCustomerFilters.ts
import { useMemo } from 'react';
import { Customer, CustomerFilters } from '../types/index';

export function useCustomerFilters(customers: Customer[], filters: CustomerFilters) {
  return useMemo(() => {
    let filtered = customers;

    // 검색 필터
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.interestedProduct.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.voiceSummaries && customer.voiceSummaries.some(vs => 
          vs.summary.toLowerCase().includes(query) ||
          vs.keyPoints.some(kp => kp.toLowerCase().includes(query))
        ))
      );
    }

    // 단계 필터
    if (filters.stageFilter !== 'all') {
      filtered = filtered.filter(customer => customer.stage === filters.stageFilter);
    }

    // 날짜 필터 적용
    if (filters.dateFilter.type !== 'all' && (filters.dateFilter.startDate || filters.dateFilter.endDate)) {
      filtered = filtered.filter(customer => {
        let targetDate: Date | null = null;
        
        switch (filters.dateFilter.type) {
          case 'registration':
            targetDate = customer.registrationDate ? new Date(customer.registrationDate) : new Date(customer.lastContact);
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
        const startTime = filters.dateFilter.startDate ? filters.dateFilter.startDate.getTime() : 0;
        const endTime = filters.dateFilter.endDate ? filters.dateFilter.endDate.getTime() + (24 * 60 * 60 * 1000 - 1) : Infinity;

        return targetTime >= startTime && targetTime <= endTime;
      });
    }

    // 정렬
    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.recentActivity || b.lastContact).getTime() - new Date(a.recentActivity || a.lastContact).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'activities':
        filtered.sort((a, b) => (b.totalActivities || 0) - (a.totalActivities || 0));
        break;
      case 'stage':
        filtered.sort((a, b) => a.stage.localeCompare(b.stage));
        break;
    }

    return filtered;
  }, [customers, filters]);
}