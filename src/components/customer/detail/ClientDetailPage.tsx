import { ArrowLeft, Edit, Phone, Mail, Calendar, Mic, MessageSquare, Video, FileText, User, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { ScrollArea } from '../../ui/scroll-area';
import { Textarea } from '../../ui/textarea';
import { mockCustomers, mockConsultations, mockTasks } from '../../data/mockData';
import type { Page } from '../../../types';

interface ClientDetailPageProps {
  customerId: string | null;
  onNavigate: (page: Page) => void;
}

export function ClientDetailPage({ customerId, onNavigate }: ClientDetailPageProps) {
  const customer = customerId ? mockCustomers.find(c => c.id === customerId) : null;
  const consultations = customerId ? mockConsultations.filter(c => c.customerId === customerId) : [];
  const tasks = customerId ? mockTasks.filter(t => t.customerId === customerId) : [];

  if (!customer) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-card-foreground mb-2">고객을 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-4 compact-line-height">요청하신 고객 정보를 찾을 수 없습니다.</p>
          <Button onClick={() => onNavigate('dashboard')} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'prospect': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'opportunity': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'customer': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getStageName = (stage: string) => {
    switch (stage) {
      case 'lead': return 'Lead';
      case 'prospect': return 'Prospect';
      case 'opportunity': return 'Opportunity';
      case 'customer': return 'Customer';
      default: return stage;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="h-full overflow-auto scrollbar-styled bg-background page-container">
      {/* Page Header */}
      <div className="border-b bg-card backdrop-blur supports-[backdrop-filter]:bg-card/60 mobile-safe-top">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="rounded-xl hover:bg-accent touch-target"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary">{customer.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-medium text-card-foreground">{customer.name}</h1>
              <p className="text-sm text-muted-foreground compact-line-height">{customer.interestedProduct}</p>
            </div>
            <Badge variant="outline" className={`rounded-full ${getStageColor(customer.stage)}`}>
              {getStageName(customer.stage)}
            </Badge>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl hidden sm:flex"
            >
              <Mic className="w-4 h-4 mr-2" />
              녹음 시작
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl hidden md:flex"
            >
              <Edit className="w-4 h-4 mr-2" />
              정보 수정
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 mobile-container">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column - Customer Info */}
            <div className="lg:col-span-1 space-y-6">

              {/* Contact Information */}
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    연락처 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-card-foreground">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-card-foreground">{customer.phone}</span>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground compact-line-height">나이</label>
                    <p className="text-sm font-medium text-card-foreground">{customer.age}세</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground compact-line-height">마지막 연락일</label>
                    <p className="text-sm font-medium text-card-foreground">{new Date(customer.lastContact).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    활동 요약
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-background rounded-xl p-3 border border-border">
                      <div className="text-lg font-medium text-card-foreground">{consultations.length}</div>
                      <div className="text-xs text-muted-foreground compact-line-height">상담 내역</div>
                    </div>
                    <div className="bg-background rounded-xl p-3 border border-border">
                      <div className="text-lg font-medium text-card-foreground">{tasks.filter(t => !t.completed).length}</div>
                      <div className="text-xs text-muted-foreground compact-line-height">대기 중 업무</div>
                    </div>
                    <div className="bg-background rounded-xl p-3 border border-border">
                      <div className="text-lg font-medium text-card-foreground">{tasks.filter(t => t.completed).length}</div>
                      <div className="text-xs text-muted-foreground compact-line-height">완료된 업무</div>
                    </div>
                    <div className="bg-background rounded-xl p-3 border border-border">
                      <div className="text-lg font-medium text-card-foreground">85%</div>
                      <div className="text-xs text-muted-foreground compact-line-height">성공률</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions - Mobile Optimized */}
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle>빠른 작업</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start rounded-xl touch-target"
                    onClick={() => onNavigate('record')}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    녹음 시작
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start rounded-xl touch-target"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    미팅 예약
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start rounded-xl touch-target"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI 제안받기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start rounded-xl touch-target"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    제안서 작성
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Activity Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Recent Consultations */}
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    최근 상담 내역
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    {consultations.length > 0 ? (
                      <div className="space-y-4">
                        {consultations.map((consultation) => (
                          <div
                            key={consultation.id}
                            className="bg-muted/30 rounded-xl p-4 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors touch-target"
                            onClick={() => onNavigate('review')}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-card-foreground">{consultation.date}</span>
                                <Badge variant="outline" className="text-xs">
                                  {consultation.time}
                                </Badge>
                              </div>
                              <Badge variant="outline" className={`text-xs ${getStageColor(consultation.stage)}`}>
                                {getStageName(consultation.stage)}
                              </Badge>
                            </div>
                            <p className="text-sm text-card-foreground normal-line-height mb-3">{consultation.summary}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Duration: {consultation.duration}</span>
                              <span>•</span>
                              <span>Sentiment: {consultation.aiInsights.sentiment}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="compact-line-height">상담 내역이 없습니다</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Tasks & Action Items */}
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    업무 및 할 일
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tasks.length > 0 ? (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 touch-target"
                        >
                          <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-orange-500'}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-card-foreground">{task.title}</h4>
                            <p className="text-xs text-muted-foreground compact-line-height">{task.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground compact-line-height">{task.dueDate}</span>
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="compact-line-height">할당된 업무가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes Section - Mobile Optimized */}
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle>메모</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="고객에 대한 메모를 추가하세요..."
                    className="min-h-[120px] md:min-h-[160px] rounded-xl resize-none"
                    defaultValue="기업용 소프트웨어 솔루션에 관심. 월 최대 $7,500 예산 승인됨. 의사결정자는 Sarah로 확인됨. IT 팀 검토 필요. 구현 일정: 2024년 1분기."
                  />
                  <Button className="mt-4 rounded-xl w-full sm:w-auto" size="sm">
                    메모 저장
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}