import React, { memo } from 'react';
import { DashboardPage } from '../DashboardPage';
import { IntegratedCustomerPage } from '../IntegratedCustomerPage';
import { ClientDetailPage } from '../customer/detail/ClientDetailPage';
import { SettingsPage } from '../SettingsPage';
import { ReviewPage } from '../review/ReviewPage';
import { RecordPage } from '../pages/RecordPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { LoginPage } from '../pages/LoginPage';
import type { Page, RecordingContext, User } from '../../types/index';
import { FloatingChatbot } from '../FloatingChatbot';

interface PageRouterProps {
  readonly currentPage: Page;
  readonly selectedCustomerId: string | null;
  readonly recordingContext: RecordingContext | null;
  readonly sttResult: {
    transcript: string;
    consultationData: any;
    aiInsights: any;
  } | null;
  readonly recordingData?: {
    recordedText: string;
    context: any;
    audioBlob?: Blob;
    recordingInfo: {
      duration: string;
      fileSize: string;
      wordCount: number;
      confidence: number;
    };
  } | null;
  // 💡 data 파라미터 추가
  readonly navigateTo: (page: Page, data?: any) => void;
  readonly selectCustomer: (customerId: string) => void;
  readonly startRecording: (context: RecordingContext) => void;
  readonly login: (user: User) => void;
  readonly logout: () => void;
}

const PAGES = {
  dashboard: DashboardPage,
  'integrated-customer': IntegratedCustomerPage,
  'client-detail': ClientDetailPage,
  settings: SettingsPage,
  review: ReviewPage,
  record: RecordPage,
  chatbot: FloatingChatbot
} as const;

//Page Router
export const PageRouter = memo<PageRouterProps>(
  ({
    currentPage,
    selectedCustomerId,
    recordingContext,
    sttResult,
    recordingData,
    navigateTo,
    selectCustomer,
    startRecording,
    login,
  }) => {
    const commonProps = {
      onNavigate: navigateTo,
      onSelectCustomer: selectCustomer,
      onStartRecording: startRecording,
    };

    // 각 페이지를 명시적으로 처리
    switch (currentPage) {
      case 'client-detail':
        if (!selectedCustomerId) throw new Error('Customer ID required');
        return <ClientDetailPage {...commonProps} customerId={selectedCustomerId} />;

      case 'record':
        if (!recordingContext) throw new Error('Recording context required');
        return <RecordPage {...commonProps} context={recordingContext} />;

      case 'review':
  if (recordingData) {
    // ReviewPage가 요구하는 형태로 데이터 변환
    const safeRecordingData = {
      recordedText: recordingData.recordedText,
      context: recordingData.context,
      audioBlob: recordingData.audioBlob || new Blob([''], { type: 'audio/wav' }),
      recordingInfo: {
        duration: recordingData.recordingInfo.duration,
        fileSize: recordingData.recordingInfo.fileSize,
        wordCount: recordingData.recordingInfo.wordCount,
        confidence: recordingData.recordingInfo.confidence,
        recordingTimeSeconds: 0  // 기본값으로 0 설정
      }
    };
    
    return <ReviewPage 
      {...commonProps} 
      recordingData={safeRecordingData}
    />;
  }
  
  if (sttResult) {
    return <ReviewPage 
      {...commonProps} 
      recordedText={sttResult.transcript}
      context={null}
    />;
  }
  
  return <ReviewPage 
    {...commonProps} 
    recordedText="" 
    context={null} 
  />;
      case 'chatbot':
        return <FloatingChatbot />;

      case 'dashboard':
        return <DashboardPage {...commonProps} />;

      case 'integrated-customer':
        return <IntegratedCustomerPage {...commonProps} />;

      case 'settings':
        return <SettingsPage {...commonProps} />;

      case 'documents':
        return <DocumentsPage />;

      case 'login':
        return <LoginPage {...commonProps} onLogin={login} />;

      default:
        throw new Error(`Unknown page: ${currentPage}`);
    }
  }
);