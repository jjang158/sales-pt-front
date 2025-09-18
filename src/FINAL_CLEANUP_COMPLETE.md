# 🚨 중복 구조 완전 정리 - 최종 단계

## ✅ 완료된 수정사항
1. **mockData.ts quickQuestions 중복 export 제거**
   - 355행의 export는 유지
   - 713행의 중복 export 삭제

## 🗑️ 삭제할 중복 구조들

### 1. src/ 폴더 전체 (완전 중복)
```
src/
├── components/ (중복)
├── data/ (중복)
├── lib/ (중복)
├── pages/ (중복)
└── types/ (중복)
```

### 2. components/ 내 중복 파일들
```
components/
├── ChatbotPage.tsx (사용 안함)
├── CustomerManagementPage.tsx (사용 안함)
├── DesignShowcase.tsx (사용 안함)
├── DetailModal.tsx (사용 안함)
├── ModernButton.tsx (사용 안함)
├── ModernCard.tsx (사용 안함)
├── MyPage.tsx (사용 안함)
├── SearchPage.tsx (사용 안함)
├── TodoPage.tsx (사용 안함)
├── common/Navigation.tsx (중복, /components/Navigation.tsx 유지)
└── mockData.ts (중복, /components/data/mockData.ts 유지)
```

### 3. 임시 문서 파일들
```
*.md (Guidelines.md 제외)
*.sh
*.txt
test-import.js
```

## 🎯 최종 깔끔한 구조
```
📁 SPT/
├── App.tsx
├── hooks/useApplicationState.ts
├── types/index.ts
├── styles/globals.css
├── guidelines/Guidelines.md
└── components/
    ├── router/PageRouter.tsx
    ├── layout/AppLayout.tsx, AppHeader.tsx
    ├── pages/ (re-export)
    ├── Navigation.tsx, ThemeProvider.tsx, FloatingChatbot.tsx
    ├── data/mockData.ts
    ├── figma/ImageWithFallback.tsx
    └── ui/ (44개 shadcn 컴포넌트)
```