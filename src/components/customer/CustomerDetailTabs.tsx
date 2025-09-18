import React from 'react';
import { Mic, CheckCircle, Circle, Plus, FileText, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Textarea } from '../ui/textarea';

interface CustomerDetailTabsProps {
  customer: {
    voiceSummaries: Array<{
      id: string;
      meetingType: string;
      date: string;
      summary: string;
      sentiment: string;
      keyPoints: string[];
    }>;
    tasks: Array<{
      id: string;
      title: string;
      description: string;
      completed: boolean;
      priority: string;
      dueDate: string;
    }>;
    consultations: Array<{
      id: string;
      date: string;
      summary: string;
    }>;
    latestVoice?: string;
    realConsultCount?: number;
    realActionCount?: number;
    realPendingCount?: number;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function CustomerDetailTabs({ customer, activeTab, onTabChange }: CustomerDetailTabsProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <Tabs value={activeTab} onValueChange={onTabChange} className="h-full">
        <TabsList className="grid w-full grid-cols-4 rounded-xl">
          <TabsTrigger value="summary" className="rounded-lg">요약</TabsTrigger>
          <TabsTrigger value="activities" className="rounded-lg">활동</TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-lg">작업</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-lg">노트</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 실제 API 상담 내용 또는 기존 음성 요약 */}
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-primary" />
                  {customer.latestVoice ? '최근 상담 내용' : '최근 음성 요약'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customer.latestVoice ? (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">실제 상담 기록</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          API 데이터
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{customer.latestVoice}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-semibold">{customer.realConsultCount}</div>
                        <div className="text-muted-foreground">총 상담</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-semibold">{customer.realActionCount}</div>
                        <div className="text-muted-foreground">처리 완료</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="font-semibold">{customer.realPendingCount}</div>
                        <div className="text-muted-foreground">처리 대기</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  customer.voiceSummaries.slice(0, 3).map((summary) => (
                    <div key={summary.id} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{summary.meetingType}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getSentimentColor(summary.sentiment)}`}>
                            {summary.sentiment}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{summary.date}</span>
                        </div>
                      </div>
                      <p className="text-sm mb-3">{summary.summary}</p>
                      {summary.keyPoints.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">주요 포인트:</span>
                          <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                            {summary.keyPoints.slice(0, 2).map((point, index) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  최근 작업
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    {task.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>전체 활동 기록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  ...customer.voiceSummaries.map(vs => ({ ...vs, type: 'voice' })),
                  ...customer.consultations.map(c => ({ ...c, type: 'consultation' }))
                ]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((activity, index) => (
                    <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-start gap-4 p-4 border rounded-lg">
                      {activity.type === 'voice' ? (
                        <Mic className="w-5 h-5 text-primary mt-1" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {[
                            ...customer.voiceSummaries.map(vs => ({ ...vs, type: 'voice' })),
                            ...customer.consultations.map(c => ({ ...c, type: 'consultation', meetingType: '상담' }))
]}
                          <span className="text-sm text-muted-foreground">{activity.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.summary}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>작업 관리</CardTitle>
              <Button size="sm" className="rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                새 작업
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>수정</DropdownMenuItem>
                            <DropdownMenuItem>완료 처리</DropdownMenuItem>
                            <DropdownMenuItem>삭제</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">마감: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>프로젝트 노트</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="고객과의 미팅 내용, 중요한 정보, 후속 조치 사항 등을 기록하세요..."
                className="min-h-32 rounded-xl"
              />
              <div className="flex justify-end mt-4">
                <Button size="sm" className="rounded-lg">
                  노트 저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}