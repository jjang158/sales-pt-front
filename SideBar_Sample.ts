// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// import { Badge } from './ui/badge';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
// import { 
//   Search, 
//   Filter, 
//   Plus, 
//   Phone, 
//   Mail, 
//   Calendar,
//   MapPin,
//   Clock,
//   Star,
//   TrendingUp,
//   FileText,
//   User
// } from 'lucide-react';
// import { ImageWithFallback } from './figma/ImageWithFallback';

// export function CustomerManagement() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedStage, setSelectedStage] = useState('all');

//   const customers = [
//     {
//       id: 1,
//       name: '김민수',
//       email: 'kim.minsu@email.com',
//       phone: '010-1234-5678',
//       stage: '계약검토',
//       lastContact: '2024-09-18',
//       value: '₩2,500,000',
//       avatar: 'KM',
//       products: ['생명보험', '건강보험'],
//       rating: 4.5,
//       notes: '가족력 고려한 건강보험 상품 관심 많음'
//     },
//     {
//       id: 2,
//       name: '이정희',
//       email: 'lee.junghee@email.com',
//       phone: '010-2345-6789',
//       stage: '상품제안',
//       lastContact: '2024-09-17',
//       value: '₩1,800,000',
//       avatar: 'LJ',
//       products: ['연금보험'],
//       rating: 4.2,
//       notes: '은퇴 준비용 연금보험 검토 중'
//     },
//     {
//       id: 3,
//       name: '박상현',
//       email: 'park.sanghyun@email.com',
//       phone: '010-3456-7890',
//       stage: '상담진행',
//       lastContact: '2024-09-16',
//       value: '₩3,200,000',
//       avatar: 'PS',
//       products: ['손해보험', '생명보험'],
//       rating: 4.8,
//       notes: '신혼부부, 종합보험 패키지 관심'
//     },
//     {
//       id: 4,
//       name: '최유진',
//       email: 'choi.yujin@email.com',
//       phone: '010-4567-8901',
//       stage: '완료',
//       lastContact: '2024-09-15',
//       value: '₩4,100,000',
//       avatar: 'CY',
//       products: ['저축보험', '생명보험'],
//       rating: 5.0,
//       notes: '계약 완료, 추가 상품 관심 표명'
//     },
//     {
//       id: 5,
//       name: '정은혜',
//       email: 'jung.eunhye@email.com',
//       phone: '010-5678-9012',
//       stage: '상담예약',
//       lastContact: '2024-09-14',
//       value: '₩1,500,000',
//       avatar: 'JE',
//       products: ['건강보험'],
//       rating: 4.0,
//       notes: '20대 여성, 기본 건강보험 가입 희망'
//     }
//   ];

// //   const stages = [
// //     { value: 'all', label: '전체', count: customers.length },
// //     { value: '신규문의', label: '신규문의', count: 12 },
// //     { value: '상담예약', label: '상담예약', count: 8 },
// //     { value: '상담진행', label: '상담진행', count: 15 },
// //     { value: '견적제시', label: '견적제시', count: 10 },
// //     { value: '상품제안', label: '상품제안', count: 7 },
// //     { value: '계약검토', label: '계약검토', count: 5 },
// //     { value: '완료', label: '완료', count: 23 }
// //   ];

// //   const getStageColor = (stage: string) => {
// //     const colors: { [key: string]: string } = {
// //       '신규문의': 'bg-blue-100 text-blue-800',
// //       '상담예약': 'bg-purple-100 text-purple-800',
// //       '상담진행': 'bg-orange-100 text-orange-800',
// //       '견적제시': 'bg-yellow-100 text-yellow-800',
// //       '상품제안': 'bg-indigo-100 text-indigo-800',
// //       '계약검토': 'bg-pink-100 text-pink-800',
// //       '완료': 'bg-green-100 text-green-800'
// //     };
// //     return colors[stage] || 'bg-gray-100 text-gray-800';
//   };

//   const filteredCustomers = customers.filter(customer => {
//     const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          customer.phone.includes(searchTerm);
//     const matchesStage = selectedStage === 'all' || customer.stage === selectedStage;
//     return matchesSearch && matchesStage;
//   });

//   return (
//     <div className="space-y-6 p-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">고객 관리</h1>
//           <p className="text-muted-foreground">고객 정보와 상담 이력을 체계적으로 관리하세요</p>
//         </div>
//         <Button>
//           <Plus className="w-4 h-4 mr-2" />
//           신규 고객 추가
//         </Button>
//       </div>

//       {/* Filters */}
//       <div className="flex items-center gap-4">
//         <div className="relative flex-1 max-w-md">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//           <Input
//             placeholder="고객명, 이메일, 전화번호로 검색..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <Button variant="outline">
//           <Filter className="w-4 h-4 mr-2" />
//           필터
//         </Button>
//       </div>

//       {/* Stage Tabs */}
//       <Tabs value={selectedStage} onValueChange={setSelectedStage}>
//         <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
//           {stages.map((stage) => (
//             <TabsTrigger key={stage.value} value={stage.value} className="text-xs">
//               <div className="flex flex-col items-center">
//                 <span>{stage.label}</span>
//                 <Badge variant="secondary" className="text-xs mt-1">
//                   {stage.count}
//                 </Badge>
//               </div>
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         <TabsContent value={selectedStage} className="mt-6">
//           {/* Customer Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {filteredCustomers.map((customer) => (
//               <Dialog key={customer.id}>
//                 <DialogTrigger asChild>
//                   <Card className="cursor-pointer hover:shadow-md transition-shadow">
//                     <CardHeader className="pb-3">
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-center gap-3">
//                           <Avatar>
//                             <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
//                             <AvatarFallback>{customer.avatar}</AvatarFallback>
//                           </Avatar>
//                           <div>
//                             <h3 className="font-semibold">{customer.name}</h3>
//                             <div className="flex items-center gap-1">
//                               {[...Array(5)].map((_, i) => (
//                                 <Star
//                                   key={i}
//                                   className={`w-3 h-3 ${
//                                     i < Math.floor(customer.rating)
//                                       ? 'text-yellow-400 fill-current'
//                                       : 'text-gray-300'
//                                   }`}
//                                 />
//                               ))}
//                               <span className="text-xs text-muted-foreground ml-1">
//                                 {customer.rating}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                         <Badge className={getStageColor(customer.stage)}>
//                           {customer.stage}
//                         </Badge>
//                       </div>
//                     </CardHeader>
//                     <CardContent className="space-y-3">
//                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                         <Mail className="w-3 h-3" />
//                         {customer.email}
//                       </div>
//                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                         <Phone className="w-3 h-3" />
//                         {customer.phone}
//                       </div>
//                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                         <Calendar className="w-3 h-3" />
//                         최근 상담: {customer.lastContact}
//                       </div>
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <TrendingUp className="w-3 h-3 text-green-600" />
//                           <span className="text-sm font-medium">{customer.value}</span>
//                         </div>
//                         <div className="flex gap-1">
//                           {customer.products.map((product, idx) => (
//                             <Badge key={idx} variant="outline" className="text-xs">
//                               {product}
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>
//                       <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
//                         {customer.notes}
//                       </p>
//                     </CardContent>
//                   </Card>
//                 </DialogTrigger>

//                 <DialogContent className="max-w-2xl">
//                   <DialogHeader>
//                     <DialogTitle className="flex items-center gap-3">
//                       <Avatar className="w-8 h-8">
//                         <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
//                         <AvatarFallback>{customer.avatar}</AvatarFallback>
//                       </Avatar>
//                       {customer.name} 상세 정보
//                     </DialogTitle>
//                   </DialogHeader>
                  
//                   <div className="grid grid-cols-2 gap-4 py-4">
//                     <div className="space-y-4">
//                       <div>
//                         <h4 className="font-medium mb-2">기본 정보</h4>
//                         <div className="space-y-2 text-sm">
//                           <div className="flex items-center gap-2">
//                             <User className="w-4 h-4" />
//                             {customer.name}
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Mail className="w-4 h-4" />
//                             {customer.email}
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Phone className="w-4 h-4" />
//                             {customer.phone}
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div>
//                         <h4 className="font-medium mb-2">상담 현황</h4>
//                         <Badge className={getStageColor(customer.stage)}>
//                           {customer.stage}
//                         </Badge>
//                         <p className="text-sm text-muted-foreground mt-2">
//                           최근 상담: {customer.lastContact}
//                         </p>
//                       </div>
//                     </div>
                    
//                     <div className="space-y-4">
//                       <div>
//                         <h4 className="font-medium mb-2">관심 상품</h4>
//                         <div className="flex flex-wrap gap-2">
//                           {customer.products.map((product, idx) => (
//                             <Badge key={idx} variant="outline">
//                               {product}
//                             </Badge>
//                           ))}
//                         </div>
//                       </div>
                      
//                       <div>
//                         <h4 className="font-medium mb-2">예상 계약금액</h4>
//                         <p className="text-lg font-semibold text-green-600">
//                           {customer.value}
//                         </p>
//                       </div>
                      
//                       <div>
//                         <h4 className="font-medium mb-2">메모</h4>
//                         <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
//                           {customer.notes}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="flex gap-2 pt-4 border-t">
//                     <Button className="flex-1">
//                       <Phone className="w-4 h-4 mr-2" />
//                       통화하기
//                     </Button>
//                     <Button variant="outline" className="flex-1">
//                       <Calendar className="w-4 h-4 mr-2" />
//                       일정 추가
//                     </Button>
//                     <Button variant="outline" className="flex-1">
//                       <FileText className="w-4 h-4 mr-2" />
//                       메모 추가
//                     </Button>
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             ))}
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }