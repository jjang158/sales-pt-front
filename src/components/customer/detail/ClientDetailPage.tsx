import React from 'react';
import { ArrowLeft, Edit, Phone, Mail, Calendar, Mic, MessageSquare, Video, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Separator } from '../../ui/separator';
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
        <div className="text-center text-muted-foreground">
          <p>고객을 찾을 수 없습니다</p>
          <Button variant="outline" onClick={() => onNavigate('dashboard')} className="mt-4 rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            할 일 관리로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'prospect': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'opportunity': return 'bg-green-100 text-green-800 border-green-200';
      case 'customer': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="h-full overflow-auto scrollbar-styled bg-gray-50/50 flex flex-col">
      {/* Page Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('dashboard')}
              className="rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs">{customer.avatar}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{customer.name}</h1>
                <Badge variant="outline" className={`rounded-full text-xs ${getStageColor(customer.stage)}`}>
                  {customer.stage}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">고객 상세 정보 및 활동 내역</p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-lg">
              <Edit className="w-4 h-4 mr-2" />
              정보 수정
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Basic Information */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <p className="font-medium">{customer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Age</label>
                    <p className="font-medium">{customer.age}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Interested Product</label>
                    <p className="font-medium">{customer.interestedProduct}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Current Stage</label>
                    <Badge variant="outline" className={`rounded-full mt-1 ${getStageColor(customer.stage)}`}>
                      {customer.stage}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="text-sm text-muted-foreground">Last Contact Date</label>
                  <p className="font-medium">{new Date(customer.lastContact).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Consultation History */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Consultation History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consultations.map((consultation) => (
                    <div 
                      key={consultation.id} 
                      className="p-4 rounded-xl bg-muted/50 hover:bg-muted/70 cursor-pointer transition-colors"
                      onClick={() => onNavigate('review')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{consultation.date}</span>
                          <span className="text-muted-foreground">at {consultation.time}</span>
                        </div>
                        <Badge variant="outline" className={`rounded-full text-xs ${getStageColor(consultation.stage)}`}>
                          {consultation.stage}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{consultation.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Duration: {consultation.duration}</span>
                        <span>•</span>
                        <span>AI Analysis: {consultation.aiInsights.sentiment}</span>
                      </div>
                    </div>
                  ))}
                  {consultations.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No consultation history</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Notes Section */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Add notes about this customer..."
                  className="min-h-[200px] rounded-xl resize-none"
                  defaultValue="Interested in enterprise software solution. Budget approved for up to $7,500/month. Decision maker identified as Sarah with IT team input required. Timeline: Q1 2024 implementation."
                />
                <Button className="mt-4 rounded-xl" size="sm">
                  Save Notes
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="destructive" 
                    className="rounded-xl flex items-center gap-2 h-12"
                    onClick={() => onNavigate('record')}
                  >
                    <Mic className="w-4 h-4" />
                    녹음 시작
                  </Button>
                  <Button variant="outline" className="rounded-xl flex items-center gap-2 h-12">
                    <Video className="w-4 h-4" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="rounded-xl flex items-center gap-2 h-12">
                    <Phone className="w-4 h-4" />
                    Make Call
                  </Button>
                  <Button variant="outline" className="rounded-xl flex items-center gap-2 h-12">
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl flex items-center gap-2 h-12 col-span-2"
                    onClick={() => onNavigate('chatbot')}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Get AI Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Tasks */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Related Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <Badge variant={task.completed ? "default" : "secondary"} className="rounded-full text-xs">
                          {task.completed ? 'Done' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No related tasks</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}