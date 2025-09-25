import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { User } from '../../types/index';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Google SSO 초기화 (가상 구현)
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  useEffect(() => {
    // Google SSO SDK 로드 시뮬레이션
    const initGoogleSSO = () => {
      // 실제 환경에서는 Google SSO SDK를 로드
      setTimeout(() => {
        setIsGoogleReady(true);
      }, 1000);
    };

    initGoogleSSO();
  }, []);

  const handleGoogleSSO = async () => {
    setIsLoading(true);

    try {
      // 실제 Google SSO 로직 시뮬레이션
      // 실제로는 window.google.accounts.oauth2.initTokenClient() 등을 사용

      await new Promise(resolve => setTimeout(resolve, 2000));

      // 가상 Google 사용자 정보
      const mockGoogleUser: User = {
        id: `google_${Date.now()}`,
        email: 'user@company.com',
        name: '김영희',
        avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        role: 'sales'
      };

      onLogin(mockGoogleUser);
    } catch (error) {
      console.error('Google SSO 로그인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Celery
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            AI 기반 영업 상담 플랫폼
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">시스템 로그인</CardTitle>
            <CardDescription>
              Google 계정으로 안전하게 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGoogleSSO}
              disabled={isLoading || !isGoogleReady}
              className="w-full h-12 text-base font-medium"
              variant="outline"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                  <span>Google 인증 중...</span>
                </div>
              ) : !isGoogleReady ? (
                <div className="flex items-center space-x-3">
                  <div className="animate-pulse rounded-full h-5 w-5 bg-gray-300"></div>
                  <span>Google SSO 초기화 중...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Google로 계속하기</span>
                </div>
              )}
            </Button>

            <div className="mt-6 text-center">
              <div className="text-xs text-gray-500 space-y-1">
                <p>🔒 안전한 Google SSO 인증</p>
                <p>* 현재는 개발용 가상 로그인입니다</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-400 text-center space-y-1">
                <p>로그인 시 다음 권한이 요청됩니다:</p>
                <p>• 기본 프로필 정보 (이름, 이메일)</p>
                <p>• 프로필 사진</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>문제가 있으신가요? <span className="text-blue-600 cursor-pointer hover:underline">고객지원</span></p>
        </div>
      </div>
    </div>
  );
};