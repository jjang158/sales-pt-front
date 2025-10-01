import React, { useState } from 'react';
import { ArrowLeft, User, Bell, Shield, Palette, Globe, Database, Mic, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import type { Page } from '../types';

//설정 페이지 
interface SettingsPageProps {
  onNavigate: (page: Page) => void;
  logout?: () => void;
}

export function SettingsPage({ onNavigate, logout }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    darkMode: false,
    language: 'ko',
    recordingQuality: 'high',
    autoTranscribe: true,
    dataSync: true,
    emailNotifications: true,
    soundAlerts: true,
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full overflow-hidden bg-gray-50/50 flex flex-col">
      {/* Page Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="flex h-16 items-center px-6">
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
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">설정</h1>
              <p className="text-sm text-muted-foreground">애플리케이션 설정을 관리합니다</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto scrollbar-styled">
        <div className="p-8 pb-20">
          <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 프로필 설정 */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <CardTitle>프로필 설정</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>이름</Label>
                  <Input placeholder="홍길동" />
                </div>
                <div className="space-y-2">
                  <Label>이메일</Label>
                  <Input placeholder="hong@company.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>부서</Label>
                <Input placeholder="영업팀" />
              </div>
            </CardContent>
          </Card>

          {/* 알림 설정 */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <CardTitle>알림 설정</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>푸시 알림</Label>
                  <p className="text-sm text-muted-foreground">새로운 할 일과 리마인더 알림을 받습니다</p>
                </div>
                <Switch 
                  checked={settings.notifications}
                  onCheckedChange={(checked: boolean) => handleSettingChange('notifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>이메일 알림</Label>
                  <p className="text-sm text-muted-foreground">중요한 업데이트를 이메일로 받습니다</p>
                </div>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked: boolean) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>소리 알림</Label>
                  <p className="text-sm text-muted-foreground">알림 발생 시 소리를 재생합니다</p>
                </div>
                <Switch 
                  checked={settings.soundAlerts}
                  onCheckedChange={(checked: boolean) => handleSettingChange('soundAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 녹음 및 분석 설정 */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                <CardTitle>녹음 및 분석 설정</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>자동 저장</Label>
                  <p className="text-sm text-muted-foreground">녹음 중 자동으로 파일을 저장합니다</p>
                </div>
                <Switch 
                  checked={settings.autoSave}
                  onCheckedChange={(checked: boolean) => handleSettingChange('autoSave', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>자동 전사</Label>
                  <p className="text-sm text-muted-foreground">녹음 완료 후 자동으로 텍스트 변환을 시작합니다</p>
                </div>
                <Switch 
                  checked={settings.autoTranscribe}
                  onCheckedChange={(checked: boolean) => handleSettingChange('autoTranscribe', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>녹음 품질</Label>
                <Select value={settings.recordingQuality} onValueChange={(value:string) => handleSettingChange('recordingQuality', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">고품질 (16-bit WAV)</SelectItem>
                    <SelectItem value="medium">보통 (8-bit WAV)</SelectItem>
                    <SelectItem value="compressed">압축 (MP3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 데이터 및 동기화 */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                <CardTitle>데이터 및 동기화</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>클라우드 동기화</Label>
                  <p className="text-sm text-muted-foreground">모든 데이터를 클라우드에 자동 백업합니다</p>
                </div>
                <Switch 
                  checked={settings.dataSync}
                  onCheckedChange={(checked: boolean) => handleSettingChange('dataSync', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="rounded-xl">
                  데이터 내보내기
                </Button>
                <Button variant="outline" className="rounded-xl">
                  데이터 가져오기  
                </Button>
                <Button variant="destructive" className="rounded-xl">
                  데이터 초기화
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 시스템 설정 */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <CardTitle>시스템 설정</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>언어</Label>
                <Select value={settings.language} onValueChange={(value:string) => handleSettingChange('language', value)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">시스템 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">버전</p>
                    <p className="font-medium">SPT v2.1.0</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">마지막 업데이트</p>
                    <p className="font-medium">2024.12.15</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">저장 용량</p>
                    <p className="font-medium">2.4GB / 10GB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">라이선스</p>
                    <p className="font-medium">Enterprise</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 보안 설정 */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <CardTitle>보안 설정</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {logout && (
                <Button
                  variant="destructive"
                  className="rounded-xl w-full md:w-auto"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
              )}
            </CardContent>
          </Card>

          </div>
        </div>
      </div>
    </div>
  );
}