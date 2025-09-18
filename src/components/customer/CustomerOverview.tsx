import React from 'react';
import { Search, Filter, Tag, CalendarDays, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Separator } from '../ui/separator';

interface CustomerSearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stageFilter: string;
  setStageFilter: (stage: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  dateFilterType: 'all' | 'registration' | 'lastContact' | 'birthday' | 'custom';
  setDateFilterType: (type: 'all' | 'registration' | 'lastContact' | 'birthday' | 'custom') => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  onDateRangeApply: (start: string, end: string) => void;
  onResetDateFilter: () => void;
  statistics?: {
    totalCustomers: number;
    totalConsults: number;
    totalActions: number;
    totalPending: number;
    completionRate: number;
  } | null;
}

export function CustomerSearchFilter({
  searchQuery,
  setSearchQuery,
  stageFilter,
  setStageFilter,
  sortBy,
  setSortBy,
  dateFilterType,
  setDateFilterType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showDatePicker,
  setShowDatePicker,
  onDateRangeApply,
  onResetDateFilter,
  statistics
}: CustomerSearchFilterProps) {

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

  return (
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
                      onResetDateFilter();
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
                        onClick={onResetDateFilter}
                        className="flex-1 rounded-xl"
                      >
                        초기화
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          if (startDate && endDate) {
                            onDateRangeApply(
                              startDate.toISOString().split('T')[0],
                              endDate.toISOString().split('T')[0]
                            );
                          }
                          setShowDatePicker(false);
                        }}
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

      {/* API 통계 정보 표시 */}
      {statistics && (
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span>총 고객: {statistics.totalCustomers}명</span>
          <span>총 상담: {statistics.totalConsults}건</span>
          <span>처리 완료: {statistics.totalActions}건</span>
          <span>대기 중: {statistics.totalPending}건</span>
          <span>처리율: {statistics.completionRate}%</span>
        </div>
      )}
    </div>
  );
}