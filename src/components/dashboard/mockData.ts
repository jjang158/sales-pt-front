export const mockAlerts = [
  {
    id: '1',
    type: 'birthday',
    title: 'Sarah Johnson 생일',
    description: '내일이 생일입니다',
    customerId: '1',
    badgeText: '내일',
    iconColor: 'text-pink-600',
    badgeColor: 'bg-pink-100 text-pink-800',
    priority: 'medium' as const
  },
  {
    id: '2',
    type: 'follow-up',
    title: '보험 갱신 안내',
    description: 'Michael Chen 자동차보험 만료 예정',
    customerId: '2',
    badgeText: '3일 후',
    iconColor: 'text-orange-600',
    badgeColor: 'bg-orange-100 text-orange-800',
    priority: 'high' as const
  }
];