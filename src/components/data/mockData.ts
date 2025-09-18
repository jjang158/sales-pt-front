import type { Customer, Task, Consultation, VoiceSummary, Alert, ScheduleEvent } from '../../types';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 34,
    email: 'sarah.johnson@samsung.com',
    phone: '+82 10-1234-5678',
    interestedProduct: '종합보험',
    stage: 'opportunity',
    lastContact: '3일 전',
    avatar: '👩‍💼',
    birthday: '1989-09-15',
    registrationDate: '2025-09-10',
    company: 'Samsung Electronics',
    occupation: 'Marketing Manager',
    status: '진행중'
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 41,
    email: 'michael.chen@company.com',
    phone: '+1 (555) 234-5678',
    interestedProduct: '생명보험',
    stage: 'prospect',
    lastContact: '2025-09-12',
    avatar: '👨‍💻',
    birthday: '1983-09-20'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    age: 29,
    email: 'emily.r@startup.io',
    phone: '+1 (555) 345-6789',
    interestedProduct: '건강보험',
    stage: 'lead',
    lastContact: '2025-09-11',
    avatar: '👩‍🔬',
    birthday: '1994-09-18'
  },
  {
    id: '4',
    name: 'David Kim',
    age: 37,
    email: 'david.kim@enterprise.com',
    phone: '+1 (555) 456-7890',
    interestedProduct: '자동차보험',
    stage: 'customer',
    lastContact: '2025-09-10',
    avatar: '👨‍💼',
    birthday: '1987-09-05'
  },
  {
    id: '5',
    name: 'Lisa Park',
    age: 45,
    email: 'lisa.park@corp.com',
    phone: '+1 (555) 567-8901',
    interestedProduct: '연금보험',
    stage: 'opportunity',
    lastContact: '2025-09-09',
    avatar: '👩‍💻',
    birthday: '1979-09-03'
  },
  {
    id: '6',
    name: 'James Wilson',
    age: 52,
    email: 'j.wilson@manufacturing.com',
    phone: '+1 (555) 678-9012',
    interestedProduct: '화재보험',
    stage: 'prospect',
    lastContact: '2025-09-08',
    avatar: '👨‍🔧',
    birthday: '1972-09-25'
  },
  {
    id: '7',
    name: 'Anna Williams',
    age: 39,
    email: 'anna.williams@tech.com',
    phone: '+1 (555) 789-0123',
    interestedProduct: '여행보험',
    stage: 'lead',
    lastContact: '2025-09-07',
    avatar: '👩‍💻',
    birthday: '1985-09-22'
  },
  {
    id: '8',
    name: 'Robert Lee',
    age: 48,
    email: 'robert.lee@finance.com',
    phone: '+1 (555) 890-1234',
    interestedProduct: '종합보험',
    stage: 'customer',
    lastContact: '2025-09-06',
    avatar: '👨‍💼',
    birthday: '1976-08-31'
  },
  {
    id: '9',
    name: 'Jessica Brown',
    age: 31,
    email: 'jessica.brown@startup.io',
    phone: '+1 (555) 901-2345',
    interestedProduct: '건강보험',
    stage: 'prospect',
    lastContact: '2025-09-05',
    avatar: '👩‍⚕️',
    birthday: '1993-09-28'
  },
  {
    id: '10',
    name: 'Thomas Garcia',
    age: 43,
    email: 'thomas.garcia@corp.com',
    phone: '+1 (555) 012-3456',
    interestedProduct: '자동차보험',
    stage: 'opportunity',
    lastContact: '2025-09-04',
    avatar: '👨‍🔧',
    birthday: '1981-09-08'
  },
  {
    id: '11',
    name: 'Maria Martinez',
    age: 36,
    email: 'maria.martinez@company.com',
    phone: '+1 (555) 123-4567',
    interestedProduct: '펫보험',
    stage: 'lead',
    lastContact: '2025-09-03',
    avatar: '👩‍🎨',
    birthday: '1988-09-30'
  },
  {
    id: '12',
    name: 'Kevin Zhang',
    age: 28,
    email: 'kevin.zhang@agency.com',
    phone: '+1 (555) 234-5678',
    interestedProduct: '상해보험',
    stage: 'prospect',
    lastContact: '2025-09-02',
    avatar: '👨‍💻',
    birthday: '1996-09-12'
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    customerId: '1',
    title: 'Sarah Johnson 미팅 - 제안서 후속',
    description: 'Enterprise Software 패키지에 대한 수정 견적서 발송 및 후속 미팅 준비',
    priority: 'high',
    dueDate: '2025-09-16',
    completed: false,
    stage: 'opportunity'
  },
  {
    id: '2',
    customerId: '2',
    title: 'Michael Chen 데모 미팅',
    description: '클라우드 솔루션 기술 데모 미팅 - 보안 기능 중심으로 준비',
    priority: 'medium',
    dueDate: '2025-09-17',
    completed: false,
    stage: 'prospect'
  },
  {
    id: '3',
    customerId: '3',
    title: 'Emily Rodriguez 초기 상담',
    description: '애널리틱스 플랫폼 니즈 파악을 위한 디스커버리 콜 진행',
    priority: 'low',
    dueDate: '2025-09-18',
    completed: true,
    stage: 'lead'
  },
  {
    id: '4',
    customerId: '4',
    title: 'David Kim 계약 갱신 미팅',
    description: 'Security Suite 구독 갱신 계약 검토 및 업그레이드 옵션 논의',
    priority: 'high',
    dueDate: '2025-09-19',
    completed: false,
    stage: 'customer'
  },
  {
    id: '5',
    customerId: '5',
    title: 'Lisa Park 기술 컨설팅',
    description: 'IT팀과 함께하는 데이터 관리 솔루션 기술 심화 세션',
    priority: 'medium',
    dueDate: '2025-09-20',
    completed: false,
    stage: 'opportunity'
  },
  {
    id: '6',
    customerId: '6',
    title: 'James Wilson 현장 방문',
    description: '제조업체 현장 방문하여 IoT 솔루션 요구사항 분석',
    priority: 'high',
    dueDate: '2025-09-21',
    completed: false,
    stage: 'prospect'
  },
  {
    id: '7',
    customerId: '1',
    title: 'Sarah Johnson 팀 워크샵',
    description: '구매 결정권자들과 실무진이 함께하는 제품 워크샵 진행',
    priority: 'medium',
    dueDate: '2025-09-22',
    completed: false,
    stage: 'opportunity'
  },
  {
    id: '8',
    customerId: '2',
    title: 'Michael Chen 견적 검토 미팅',
    description: '클라우드 마이그레이션 견적서 설명 및 질의응답 세션',
    priority: 'medium',
    dueDate: '2025-09-23',
    completed: false,
    stage: 'prospect'
  }
];

export const mockConsultations: Consultation[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'Sarah Johnson',
    date: '2025-09-13',
    time: '10:30 AM',
    duration: '45 min',
    summary: 'Discussed enterprise software requirements and pricing options.',
    stage: 'opportunity',
    transcript: `[10:30] Sarah: Good morning! Thanks for taking the time to meet with me today.

[10:31] Agent: Of course, Sarah. I'm excited to discuss how our enterprise software can help streamline your operations. Can you tell me a bit about your current challenges?

[10:32] Sarah: We're struggling with data silos across our departments. Our sales, marketing, and customer service teams all use different systems, and it's creating inefficiencies.

[10:34] Agent: That's a common issue we help solve. Our platform provides a unified dashboard that integrates all your existing tools. How many users would need access?

[10:35] Sarah: Around 150 users across three departments. What kind of pricing are we looking at?

[10:37] Agent: For 150 users, our Enterprise plan would be $50 per user per month, which includes full integration support and dedicated account management.

[10:39] Sarah: That's within our budget range. What about implementation time?

[10:40] Agent: Typically 4-6 weeks for full deployment with training. We assign a dedicated implementation specialist to ensure smooth rollout.

[10:42] Sarah: Sounds promising. Can you send me a detailed proposal with timeline?

[10:43] Agent: Absolutely. I'll have that to you by end of week. Any other questions I can address today?

[10:45] Sarah: Not right now. Looking forward to the proposal. Thanks!`,
    aiInsights: {
      summary: 'Client is interested in enterprise software solution for 150 users. Budget approved, requesting detailed proposal.',
      keywords: ['enterprise software', 'data silos', '150 users', 'pricing', 'implementation'],
      sentiment: 'positive',
      nextSteps: ['Send detailed proposal by end of week', 'Include implementation timeline', 'Schedule follow-up call']
    }
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'Michael Chen',
    date: '2025-09-12',
    time: '2:00 PM',
    duration: '30 min',
    summary: 'Initial discovery call about cloud migration needs.',
    stage: 'prospect',
    transcript: `[14:00] Michael: Hi there, thanks for reaching out about cloud solutions.

[14:01] Agent: Thanks for your time, Michael. I understand you're exploring cloud migration options?

[14:02] Michael: Yes, we're currently on-premise but looking to modernize our infrastructure. We have about 50TB of data.

[14:04] Agent: That's a significant migration. What's driving the move to cloud?

[14:05] Michael: Cost optimization and better scalability. Our current setup is expensive to maintain and doesn't scale well.

[14:07] Agent: Our cloud platform can definitely help with both. We offer automatic scaling and typically see 30-40% cost reduction.

[14:09] Michael: What about security? That's a big concern for us.

[14:10] Agent: Security is built into everything we do. We're SOC2 certified and offer end-to-end encryption.

[14:12] Michael: Good to hear. What would the migration process look like?

[14:14] Agent: We start with a comprehensive assessment, then plan a phased migration to minimize downtime.

[14:16] Michael: How long does that typically take?

[14:17] Agent: For your data volume, probably 3-4 months for complete migration.

[14:19] Michael: I'd like to see a demo of your platform before we proceed.

[14:20] Agent: Perfect. Are you available next Tuesday for a technical demonstration?

[14:21] Michael: Tuesday works. Send me the calendar invite.

[14:22] Agent: Will do. Any specific features you'd like to see in the demo?

[14:24] Michael: Focus on security features and migration tools.

[14:25] Agent: Noted. Looking forward to Tuesday's demo.`,
    aiInsights: {
      summary: 'Prospect interested in cloud migration for cost optimization and scalability. Demo scheduled for next Tuesday.',
      keywords: ['cloud migration', '50TB data', 'cost optimization', 'security', 'demo'],
      sentiment: 'neutral',
      nextSteps: ['Send calendar invite for Tuesday demo', 'Prepare security-focused demonstration', 'Create migration assessment proposal']
    }
  }
];

export const mockChatHistory = [
  {
    id: '1',
    type: 'user' as const,
    message: 'How do I prioritize my leads?',
    timestamp: '10:30 AM'
  },
  {
    id: '2',
    type: 'bot' as const,
    message: 'Great question! Here are the key factors to consider when prioritizing leads:\n\n1. **Budget & Authority** - Does the lead have decision-making power and budget?\n2. **Timeline** - How urgently do they need a solution?\n3. **Fit Score** - How well does your product match their needs?\n4. **Engagement Level** - Are they actively responding and engaging?\n\nWould you like me to help you score any specific leads?',
    timestamp: '10:31 AM'
  },
  {
    id: '3',
    type: 'user' as const,
    message: 'What questions should I ask during discovery calls?',
    timestamp: '2:15 PM'
  },
  {
    id: '4',
    type: 'bot' as const,
    message: 'Here are essential discovery questions organized by category:\n\n**Current State:**\n• What tools/systems are you currently using?\n• What challenges are you facing with your current solution?\n\n**Goals & Objectives:**\n• What are your main goals for this project?\n• How will you measure success?\n\n**Decision Process:**\n• Who else is involved in this decision?\n• What\'s your timeline for implementation?\n\n**Budget & Resources:**\n• What budget range have you allocated?\n• Do you have internal resources for implementation?\n\nRemember to listen more than you talk!',
    timestamp: '2:16 PM'
  }
];

export const quickQuestions = [
  'How to handle objections?',
  'Best follow-up timing?',
  'Closing techniques',
  'Qualification criteria',
  'Demo best practices'
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'birthday',
    title: 'Sarah Johnson 고객 생일',
    description: '내일 • 생일 축하 메시지 발송',
    priority: 'medium',
    customerId: '1',
    customerName: 'Sarah Johnson',
    dueDate: '2025-09-15',
    isRead: false,
    createdAt: '2025-09-14',
    badgeText: '생일',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
    iconColor: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 shadow-lg hover:bg-pink-100/70 transition-colors cursor-pointer dark:bg-pink-900/20 dark:hover:bg-pink-900/30'
  },
  {
    id: '2',
    type: 'follow-up',
    title: 'Emily Rodriguez 고객 팔로업',
    description: '2일 지연 • 건강보험 제안서 피드백 확인',
    priority: 'high',
    customerId: '3',
    customerName: 'Emily Rodriguez',
    dueDate: '2025-09-12',
    isRead: false,
    createdAt: '2025-09-14',
    badgeText: '지연',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 shadow-lg hover:bg-orange-100/70 transition-colors cursor-pointer dark:bg-orange-900/20 dark:hover:bg-orange-900/30'
  },
  {
    id: '3',
    type: 'meeting',
    title: 'Michael Chen 미팅',
    description: '30분 후 • 생명보험 데모 미팅',
    priority: 'high',
    customerId: '2',
    customerName: 'Michael Chen',
    dueDate: '2025-09-14',
    isRead: false,
    createdAt: '2025-09-14',
    badgeText: '임박',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 shadow-lg hover:bg-blue-100/70 transition-colors cursor-pointer dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
  },
  {
    id: '4',
    type: 'contract',
    title: 'David Kim 계약 마감',
    description: '내일 마감 • 자동차보험 갱신 최종 검토 필요',
    priority: 'high',
    customerId: '4',
    customerName: 'David Kim',
    dueDate: '2025-09-15',
    isRead: false,
    createdAt: '2025-09-14',
    badgeText: '긴급',
    badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 shadow-lg hover:bg-red-100/70 transition-colors cursor-pointer dark:bg-red-900/20 dark:hover:bg-red-900/30'
  },
  {
    id: '5',
    type: 'birthday',
    title: 'Anna Williams 고객 생일',
    description: '1주일 후 • 생일 선물 준비',
    priority: 'low',
    customerId: '7',
    customerName: 'Anna Williams',
    dueDate: '2025-09-22',
    isRead: false,
    createdAt: '2025-09-14',
    badgeText: '예정',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 shadow-lg hover:bg-purple-100/70 transition-colors cursor-pointer dark:bg-purple-900/20 dark:hover:bg-purple-900/30'
  },
  {
    id: '6',
    type: 'overdue',
    title: 'James Wilson 팔로업',
    description: '3일 지연 • 화재보험 견적서 확인 연락',
    priority: 'high',
    customerId: '6',
    customerName: 'James Wilson',
    dueDate: '2025-09-11',
    isRead: false,
    createdAt: '2025-09-11',
    badgeText: '지연',
    badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 shadow-lg hover:bg-red-100/70 transition-colors cursor-pointer dark:bg-red-900/20 dark:hover:bg-red-900/30'
  }
];

export const mockScheduleEvents: ScheduleEvent[] = [
  // 오늘 (2025-09-14) 일��
  {
    id: 'event-1',
    customerId: '1',
    title: 'Sarah Johnson 종합보험 상담',
    description: '가족형 종합보험 상품 설명 및 견적 제공, 기존 보험과의 차이점 분석',
    date: '2025-09-14',
    time: '09:00',
    priority: 'high',
    status: 'pending',
    type: 'consultation'
  },
  {
    id: 'event-2',
    customerId: '2',
    title: 'Michael Chen 생명보험 데모',
    description: '20년 납입 생명보험 상품 데모 및 보장 내용 상세 설명',
    date: '2025-09-14',
    time: '10:30',
    priority: 'high',
    status: 'pending',
    type: 'consultation'
  },
  {
    id: 'event-3',
    customerId: '3',
    title: 'Emily Rodriguez 건강보험 팔로업',
    description: '지난주 제안한 개인 건강보험 상품에 대한 피드백 확인 및 추가 질의응답',
    date: '2025-09-14',
    time: '14:00',
    priority: 'medium',
    status: 'pending',
    type: 'follow-up'
  },
  {
    id: 'event-4',
    customerId: '4',
    title: 'David Kim 자동차보험 갱신',
    description: '신규 차량 추가에 따른 자동차보험 갱신 계약 진행 및 서류 작성',
    date: '2025-09-14',
    time: '16:00',
    priority: 'high',
    status: 'pending',
    type: 'renewal'
  },
  // 내일 (2025-09-15) 일정
  {
    id: 'event-5',
    customerId: '5',
    title: 'Lisa Park 연금보험 컨설팅',
    description: '은퇴 시기별 연금액 시뮬레이션 제공 및 세액공제 혜택 설명',
    date: '2025-09-15',
    time: '10:00',
    priority: 'medium',
    status: 'pending',
    type: 'consultation'
  },
  {
    id: 'event-6',
    customerId: '6',
    title: 'James Wilson 화재보험 계약',
    description: '제조업체 화재보험 최종 계약서 검토 및 계약 체결',
    date: '2025-09-15',
    time: '14:30',
    priority: 'high',
    status: 'pending',
    type: 'contract'
  },
  // 모레 (2025-09-16) 일정
  {
    id: 'event-7',
    customerId: '7',
    title: 'Anna Williams 여행보험 상담',
    description: '해외 출장용 여행보험 상품 안내 및 보장 범위 설명',
    date: '2025-09-16',
    time: '11:00',
    priority: 'low',
    status: 'pending',
    type: 'consultation'
  },
  {
    id: 'event-8',
    customerId: '8',
    title: 'Robert Lee 종합보험 클레임',
    description: '기존 종합보험 보험금 청구 접수 및 서류 안내',
    date: '2025-09-16',
    time: '15:00',
    priority: 'high',
    status: 'pending',
    type: 'claim'
  },
  // 어제 (2025-09-13) 일정 - 완료된 상태
  {
    id: 'event-9',
    customerId: '9',
    title: 'Jessica Brown 건강보험 초기 상담',
    description: '개인 건강보험 상품 안내 및 보장 범위 설명',
    date: '2025-09-13',
    time: '10:00',
    priority: 'medium',
    status: 'completed',
    type: 'consultation'
  },
  {
    id: 'event-10',
    customerId: '10',
    title: 'Thomas Garcia 자동차보험 견적',
    description: '신규 자동차보험 가입을 위한 견적 상담',
    date: '2025-09-13',
    time: '15:30',
    priority: 'medium',
    status: 'completed',
    type: 'consultation'
  }
];

export const mockVoiceSummaries: VoiceSummary[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'Sarah Johnson',
    date: '2025-09-13',
    time: '11:15 AM',
    duration: '3 min',
    meetingType: '제안서 검토 미팅',
    summary: '종합보험 패키지에 대한 긍정적 반응. 보장 범위와 보험료에 만족. IT 팀 검토 후 최종 결정 예정.',
    keyPoints: [
      '월 보험료 15만원 예산 내 적합',
      '가족 보장 옵션에 특히 관심',
      '기존 보험 해지 절차 문의'
    ],
    actionItems: [
      '가족 보장 상세 설명서 발송',
      'IT 팀 검토를 위한 기술 문서 준비',
      '기존 보험 해지 절차 안내'
    ],
    nextMeetingDate: '2025-09-16',
    sentiment: 'positive',
    audioUrl: '/audio/summary-1.mp3'
  },
  {
    id: '2',
    customerId: '1',
    customerName: 'Sarah Johnson',
    date: '2025-09-10',
    time: '2:30 PM',
    duration: '2 min',
    meetingType: '초기 상담',
    summary: '종합보험 상품에 대한 기본 정보 제공. 가족 구성원 보장 범위 중심으로 설명.',
    keyPoints: [
      '4인 가족 보험 적용 원함',
      '월 20만원 이하 예산',
      '기존 생명보험 있음'
    ],
    actionItems: [
      '가족형 종합보험 견적서 작성',
      '기존 보험과 비교 분석',
      '다음 미팅 일정 조율'
    ],
    sentiment: 'neutral'
  },
  {
    id: '3',
    customerId: '2',
    customerName: 'Michael Chen',
    date: '2025-09-12',
    time: '2:45 PM',
    duration: '4 min',
    meetingType: '생명보험 상담',
    summary: '생명보험 상품 데모 미팅 완료. 보장 내용과 납입 기간에 대한 상세 논의.',
    keyPoints: [
      '20년 납입 생명보험 선호',
      '보장 금액 3억원 희망',
      '건강검진 결과 우수'
    ],
    actionItems: [
      '20년 납입 상품 견적 제공',
      '건강검진 혜택 적용 계산',
      '보험금 지급 사례 자료 제공'
    ],
    nextMeetingDate: '2025-09-17',
    sentiment: 'positive'
  },
  {
    id: '4',
    customerId: '3',
    customerName: 'Emily Rodriguez',
    date: '2025-09-11',
    time: '10:15 AM',
    duration: '2 min',
    meetingType: '건강보험 문의',
    summary: '건강보험 상품 초기 문의. 개인 건강보험과 가족 건강보험 옵션 비교 설명.',
    keyPoints: [
      '개인 건강보험 우선 고려',
      '암보험 특약 관심',
      '보험료 부담 우려'
    ],
    actionItems: [
      '개인 건강보험 기본 상품 안내',
      '암보험 특약 상세 설명',
      '보험료 할인 혜택 검토'
    ],
    sentiment: 'neutral'
  },
  {
    id: '5',
    customerId: '4',
    customerName: 'David Kim',
    date: '2025-09-10',
    time: '4:00 PM',
    duration: '5 min',
    meetingType: '자동차보험 갱신',
    summary: '기존 자동차보험 갱신 상담. 신규 차량 추가로 인한 보험 변경 필요.',
    keyPoints: [
      '신규 SUV 차량 추가',
      '기존 할인 혜택 유지 희망',
      '보장 범위 확대 검토'
    ],
    actionItems: [
      '신규 차량 보험료 산정',
      '기존 할인 혜택 적용 확인',
      '종합보험 패키지 제안'
    ],
    nextMeetingDate: '2025-09-19',
    sentiment: 'positive'
  },
  {
    id: '6',
    customerId: '5',
    customerName: 'Lisa Park',
    date: '2025-09-09',
    time: '3:20 PM',
    duration: '3 min',
    meetingType: '연금보험 상담',
    summary: '연금보험 상품 설명 완료. 은퇴 후 생활비 마련을 위한 연금 가입 상담.',
    keyPoints: [
      '55세 은퇴 목표',
      '월 200만원 연금 희망',
      '세액공제 혜택 중요'
    ],
    actionItems: [
      '은퇴 시기별 연금액 시뮬레이션',
      '세액공제 혜택 상세 안내',
      '추가 적립 방안 제안'
    ],
    sentiment: 'positive'
  }
];