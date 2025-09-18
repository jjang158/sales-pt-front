// components/customer/dashboard/CustomerOverview.tsx
import React from 'react';
import { Search } from 'lucide-react';
import { RecordingContext, Customer } from '../../../types/index';
import { CustomerCard } from './CustomerCard';

interface CustomerOverviewProps {
  customers: Customer[];
  onSelectCustomer: (customerId: string) => void;
  onStartRecording?: (context: RecordingContext) => void;
}

export function CustomerOverview({ customers, onSelectCustomer, onStartRecording }: CustomerOverviewProps) {
  if (customers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">검색 결과가 없습니다</h3>
          <p className="text-sm text-muted-foreground">다른 키워드로 검색하거나 필터를 조정해 보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 h-full overflow-y-auto scroll-container scrollbar-styled p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onSelect={onSelectCustomer}
              onStartRecording={onStartRecording}
            />
          ))}
        </div>
      </div>
    </div>
  );
}