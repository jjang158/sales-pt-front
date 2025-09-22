# 샐러리(Celery) 개발 가이드라인

## 프로젝트 개요
영업 생산성 도구(샐러리)는 태블릿에 최적화된 영업 관리 시스템으로, 현대적이고 미니멀한 디자인을 채택하여 영업 담당자들의 생산성을 극대화합니다.

## 핵심 설계 원칙

### 1. 사용성 우선 (Usability First)
- 태블릿 환경에 최적화된 터치 인터페이스
- 직관적인 네비게이션과 분할 뷰 구조
- 한 번의 터치로 접근 가능한 주요 기능들

### 2. 시각적 일관성 (Visual Consistency)
- 둥근 모서리 (`rounded-xl`, `rounded-2xl`) 통일 사용
- 부드러운 그림자 (`shadow-md`, `shadow-lg`) 적용
- 일관된 색상 팔레트와 타이포그래피

### 3. 반응형 설계 (Responsive Design)
- 태블릿을 기본으로 하되 데스크톱 환경도 지원
- `lg:` 브레이크포인트 적극 활용
- 컨테이너 기반 반응형 레이아웃

## 페이지 구조

### 주요 페이지 (8개)
1. **대시보드** (`dashboard`) - 메인 화면, 일정 및 워크플로우 관리
2. **고객 관리** (`integrated-customer`) - 통합 고객 관리 및 검색
3. **고객 상세** (`client-detail`) - 개별 고객 정보 및 이력
4. **검토 분석** (`review`) - 성과 분석 및 리포트
5. **설정** (`settings`) - 시스템 설정 및 사용자 관리
6. **녹음** (`record`) - 미팅 후 음성 메모 및 자동 전사 기능 (대시보드에서만 접근)

### 컴포넌트 아키텍처
```
/components
├── 페이지 컴포넌트 (Page Components)
├── UI 컴포넌트 (/ui - shadcn/ui 기반)
├── 공통 컴포넌트 (Navigation, ThemeProvider 등)
├── 데이터 (/data/mockData.ts)
└── 유틸리티 컴포넌트
```

## 기술 스택

### 프론트엔드
- **React 18** - 컴포넌트 기반 UI 프레임워크
- **TypeScript** - 타입 안전성 보장
- **Tailwind CSS v4** - 유틸리티 퍼스트 CSS 프레임워크
- **shadcn/ui** - 고품질 UI 컴포넌트 라이브러리
- **Lucide React** - 일관된 아이콘 시스템

### 상태 관리
- React의 기본 `useState`, `useCallback` 훅 활용
- 페이지 간 상태는 App.tsx에서 중앙 관리
- 로컬 상태는 각 컴포넌트에서 관리

## 코딩 표준

### 1. 컴포넌트 구조
```tsx
// 1. Import 순서: React → 외부 라이브러리 → 내부 컴포넌트 → 타입
import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Navigation } from './Navigation';
import type { Page } from '../types';

// 2. 타입 정의 (인터페이스 우선)
interface ComponentProps {
  // props 정의
}

// 3. 컴포넌트 정의 (export와 함께)
export function ComponentName({ ...props }: ComponentProps) {
  // 훅 정의
  // 이벤트 핸들러 정의 (useCallback 활용)
  // 렌더링 로직
}
```

### 2. 스타일링 가이드라인
- **Tailwind 클래스 순서**: 레이아웃 → 크기 → 색상 → 기타
- **반응형**: 모바일 퍼스트, `lg:` 브레이크포인트 활용
- **색상**: CSS 변수 기반 테마 시스템 사용
- **애니메이션**: `transition-` 클래스로 부드러운 전환

### 3. 타입 정의
```typescript
// /types/index.ts에 중앙화
export interface Customer {
  id: string;
  name: string;
  // ... 기타 속성
}

export type Page = 'dashboard' | 'client-detail' | ...;
```

## 성능 최적화

### 1. 컴포넌트 최적화
- `useCallback`으로 이벤트 핸들러 메모이제이션
- 불필요한 리렌더링 방지
- 조건부 렌더링으로 DOM 최적화

### 2. CSS 최적화
- `contain` 속성으로 레이아웃 스래싱 방지
- 하드웨어 가속 활용 (`transform`, `opacity`)
- 불필요한 CSS 계산 최소화

### 3. 데이터 관리
- Mock 데이터 활용으로 빠른 프로토타이핑
- 지연 로딩과 가상화 적용 (필요시)

## 접근성 (Accessibility)

### 키보드 네비게이션
- 모든 인터랙티브 요소에 키보드 접근 가능
- `tabindex` 적절히 설정
- Focus 상태 시각적 표시

### 스크린 리더 지원
- `aria-label`, `aria-describedby` 적절히 사용
- 의미론적 HTML 태그 활용
- 색상 외 다른 시각적 단서 제공

## 테마 시스템

### 다크/라이트 모드
- CSS 변수 기반 테마 전환
- `ThemeProvider`로 전역 테마 관리
- 사용자 선호도 저장 및 복원

### 색상 팔레트
- Primary: 어두운 네이비 계열
- Secondary: 중성 그레이 계열
- Accent: 블루/그린 계열 (상태별)
- Background: 화이트/다크 그레이

## 배포 및 유지보수

### 파일 구조 관리
- 컴포넌트별 단일 책임 원칙
- 재사용 가능한 컴포넌트 분리
- 명확한 폴더 구조와 네이밍 컨벤션

### 버전 관리
- 의미있는 커밋 메시지
- 기능별 브랜치 전략
- 코드 리뷰 프로세스

## 보안 고려사항
- PII (개인식별정보) 수집 최소화
- 클라이언트 사이드 검증과 함께 서버 사이드 검증 필요
- API 키 및 민감한 정보는 환경 변수로 관리