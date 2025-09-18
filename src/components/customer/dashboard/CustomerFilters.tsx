// components/customer/dashboard/CustomerFilters.tsx
import React from 'react';
import { Search, Filter, Tag, CalendarDays, X } from 'lucide-react';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Calendar as CalendarComponent } from '../../ui/calendar';
import { Separator } from '../../ui/separator';
import { CustomerFilters as CustomerFiltersType } from '../../../types/index';

interface CustomerFiltersProps {
  filters: CustomerFiltersType;
  onFiltersChange: (filters: Partial<CustomerFiltersType>) => void;
}

export function CustomerFilters({ filters, onFiltersChange }: CustomerFiltersProps) {
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const resetDateFilter = () => {
    onFiltersChange({
      dateFilter: {
        type: 'all',
        startDate: undefined,
        endDate: undefined
      }
    });
  };

  const getDateFilterLabel = () => {
    switch (filters.dateFilter.type) {
      case 'registration': return '등록일';
      case 'lastContact': return '마지막 연락일';
      case 'birthday': return '생일';
      default: return '날짜';
    }
  };

  const formatDateRange = () => {
    const { startDate, endDate } = filters.dateFilter;
    if (!startDate && !endDate) return '';
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`;
    }
    if (startDate) return `${startDate.toLocaleDateString()} 이후`;
    if (endDate) return `${endDate.toLocaleDateString()} 이전`;
    return '';
  };

  return (
    <div className="border-b border-border px-4 py-3 bg-muted/20">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-80">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="고객명, 상품, 키워드로 검색..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
              className="pl-10 rounded-xl bg-background"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <Select 
            value={filters.stageFilter} 
            onValueChange={(value : string) => onFiltersChange({ stageFilter: value })}
          >
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

        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={`w-44 rounded-xl justify-start text-left bg-background hover:bg-muted/50 ${
                  filters.dateFilter.type !== 'all' ? 'border-primary' : ''
                }`}
              >
                <CalendarDays className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">
                  {filters.dateFilter.type !== 'all' ? `${getDateFilterLabel()}` : '날짜 필터'}
                </span>
                {filters.dateFilter.type !== 'all' && (
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
                  <Select 
                    value={filters.dateFilter.type} 
                    onValueChange={(value: any) => onFiltersChange({
                      dateFilter: { ...filters.dateFilter, type: value }
                    })}
                  >
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
                
                {filters.dateFilter.type !== 'all' && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">시작일</label>
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateFilter.startDate}
                          onSelect={(date: Date | undefined) => onFiltersChange({
                            dateFilter: { ...filters.dateFilter, startDate: date }
                          })}
                          className="rounded-md border"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">종료일</label>
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateFilter.endDate}
                          onSelect={(date:Date | undefined) => onFiltersChange({
                            dateFilter: { ...filters.dateFilter, endDate: date }
                          })}
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
          <Select 
            value={filters.sortBy} 
            onValueChange={(value:string) => onFiltersChange({ sortBy: value })}
          >
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
  );
}