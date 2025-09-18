import React, { memo } from 'react';
import { DashboardPage } from '../DashboardPage';
import { IntegratedCustomerPage } from '../IntegratedCustomerPage';
import { ClientDetailPage } from '../ClientDetailPage';
import { SettingsPage } from '../SettingsPage';
import { ReviewPage } from '../ReviewPage';
import { RecordPage } from '../RecordPage';
import type { Page, RecordingContext } from '../../types/index';

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
}

const PAGES = {
  dashboard: DashboardPage,
  'integrated-customer': IntegratedCustomerPage,
  'client-detail': ClientDetailPage,
  settings: SettingsPage,
  review: ReviewPage,
  record: RecordPage,
} as const;

/**
 * Type-safe page router with O(1) resolution
 */
export const PageRouter = memo<PageRouterProps>(
  ({
    currentPage,
    selectedCustomerId,
    recordingContext,
    sttResult,
    recordingData, // 💡 recordingData 추가
    navigateTo,
    selectCustomer,
    startRecording,
  }) => {
    const Component = PAGES[currentPage];
    const commonProps = {
      onNavigate: navigateTo,
      onSelectCustomer: selectCustomer,
      onStartRecording: startRecording,
    };

    if (currentPage === 'client-detail') {
      if (!selectedCustomerId) throw new Error('Customer ID required');
      return <Component {...commonProps} customerId={selectedCustomerId} />;
    }

    if (currentPage === 'record') {
      if (!recordingContext) throw new Error('Recording context required');
      return <Component {...commonProps} context={recordingContext} />;
    }

    if (currentPage === 'review') {
      console.log('PageRouter - recordingData:', recordingData);
      console.log('PageRouter - sttResult:', sttResult);
      // recordingData가 있으면 ReviewPage에 전체 객체로 전달
      if (recordingData) {
        return <Component 
          {...commonProps} 
          recordingData={recordingData}  // 🔥 이 부분이 핵심!
          recordedText={recordingData.recordedText}  // 하위 호환성
          context={recordingData.context}  // 하위 호환성
      />;
  }
  
  // recordingData가 있으면 ReviewPage에 전달
  if (recordingData) {
    return <Component 
      {...commonProps} 
      recordedText={recordingData.recordedText}
      context={recordingData.context}
    />;
  }
  
  // sttResult가 있으면 기존 방식으로 전달
  if (sttResult) {
    return <Component {...commonProps} sttResult={sttResult} />;
  }
  
  // 둘 다 없으면 빈 데이터로 진행
  console.warn('No recording data or STT result available for review page');
  return <Component 
    {...commonProps} 
    recordedText="" 
    context={null} 
  />;
}

    return <Component {...commonProps} />;
  }
);