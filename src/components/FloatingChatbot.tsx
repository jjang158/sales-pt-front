import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, X, Settings, RotateCcw, Send, Mic, Paperclip, Clock, Maximize2, Minimize2, Loader2, Plus, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardHeader, CardTitle } from './ui/card';
import { FileUpload } from './ui/file-upload';
import { consultAPI, apiUtils, type ChatMessage, type ChatbotSource } from '../lib/api';
import { ChevronDown, FileText } from 'lucide-react';


interface FloatingChatbotProps {
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: string;
  sources?: ChatbotSource[]; // AI 응답에 포함된 소스 정보
  isLoading?: boolean; // 로딩 상태
}

export function FloatingChatbot({ className = '' }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 드래그 관련 상태
  const [position, setPosition] = useState<Position>({ x: 40, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  const [expandedSources, setExpandedSources] = useState<string[]>([]);

  const toggleSource = useCallback((messageId: string) => {
  setExpandedSources(prev => 
    prev.includes(messageId) 
      ? prev.filter(id => id !== messageId)
      : [...prev, messageId]
  );
}, []);

  // FAQ 빠른 질문 데이터
  const faqPlaceholders = [
    "고객 정보 조회",
    "최근 상담 내역", 
    "계약 현황 확인",
    "일정 관리"
  ];

  // 초기 환영 메시지
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        text: '안녕하세요! 고객 정보 검색과 상담 지원을 도와드릴 AI 어시스턴트입니다. 무엇을 도와드릴까요?',
        timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  // 메시지 스크롤 자동 이동
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // localStorage에서 위치 복원
  useEffect(() => {
    const savedPosition = localStorage.getItem('spt-chatbot-position');
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        if (parsed.x >= 20 && parsed.x <= 200 && parsed.y >= 20 && parsed.y <= 200) {
          setPosition(parsed);
        }
      } catch (error) {
        console.warn('챗봇 위치 복원 실패:', error);
      }
    }
  }, []);

  // 포커스 관리
  useEffect(() => {
    if (isOpen && !isFullscreen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isFullscreen]);

  // 위치 저장
  const savePosition = useCallback((newPosition: Position) => {
    localStorage.setItem('spt-chatbot-position', JSON.stringify(newPosition));
  }, []);

  // 드래그 관련 함수들 (기존과 동일)
  const constrainPosition = useCallback((pos: Position): Position => {
    return {
      x: Math.max(20, Math.min(200, pos.x)),
      y: Math.max(20, Math.min(200, pos.y))
    };
  }, []);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (isOpen) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    document.body.style.userSelect = 'none';
  }, [isOpen]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = dragStart.x - clientX;
    const deltaY = clientY - dragStart.y;
    const newPosition = constrainPosition({
      x: position.x + deltaX,
      y: position.y - deltaY
    });
    setPosition(newPosition);
    setDragStart({ x: clientX, y: clientY });
  }, [isDragging, dragStart, position, constrainPosition]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    document.body.style.userSelect = '';
    savePosition(position);
  }, [isDragging, position, savePosition]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  }, [handleDragStart]);

  // 전역 드래그 이벤트 리스너
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };

    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // 챗봇 토글
  const toggleChat = useCallback(() => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsFullscreen(false);
    }
  }, [isOpen]);

  // 전체화면 토글
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // 대화 초기화
  const resetChat = useCallback(() => {
    setMessages([]);
    // 환영 메시지가 useEffect에서 자동으로 추가됨
  }, []);

  // 메시지 히스토리를 API 형식으로 변환
  const getApiHistory = useCallback((): ChatMessage[] => {
    return messages
      .filter(msg => !msg.isLoading) // 로딩 중인 메시지 제외
      .slice(-10) // 최근 10개 메시지만 (API 부하 고려)
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
  }, [messages]);

  // 파일 업로드 핸들러
  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length > 0) {
      const fileNames = files.map(f => f.name).join(', ');
      const fileMessage = `📎 파일 업로드: ${fileNames}`;
      setMessage(prev => prev ? `${prev}\n${fileMessage}` : fileMessage);
    }
  }, []);

  // 파일 업로드 토글
  const toggleFileUpload = useCallback(() => {
    setShowFileUpload(!showFileUpload);
  }, [showFileUpload]);

  // 메시지 전송
  const handleSendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    // 로딩 메시지 생성
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      text: '답변을 생성하고 있습니다...',
      timestamp: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setMessage('');
    setShowFileUpload(false);
    setIsLoading(true);

    try {
      // API 호출
      const history = getApiHistory();
      const response = await consultAPI.sendChatMessage(textToSend, history);

      // 로딩 메시지를 실제 응답으로 교체
      const botMessage: Message = {
        id: loadingMessage.id,
        type: 'bot',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        sources: response.sources
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id ? botMessage : msg
        )
      );

    } catch (error) {
      console.error('챗봇 응답 실패:', error);
      
      // 에러 메시지로 교체
      const errorMessage: Message = {
        id: loadingMessage.id,
        type: 'bot',
        text: `죄송합니다. 응답을 생성하는 중 오류가 발생했습니다: ${apiUtils.formatErrorMessage(error)}`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id ? errorMessage : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [message, isLoading, getApiHistory]);

  // 키보드 이벤트
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // ESC 키로 챗봇 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isFullscreen]);

  // renderMessage 함수 내부의 소스 정보 부분을 다음으로 교체:

// 메시지 렌더링 함수
// 메시지 렌더링 함수 (기존 함수를 완전히 교체)
const renderMessage = (msg: Message) => (
  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className="max-w-[80%]">
      <div 
        className={`
          p-3 rounded-2xl shadow-sm transition-colors
          ${msg.type === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground'
          }
          ${msg.isLoading ? 'opacity-70' : ''}
        `}
        role={msg.type === 'bot' ? 'status' : undefined}
        aria-label={msg.type === 'bot' ? 'AI 응답' : '내 메시지'}
      >
        <p className="text-sm leading-5">
          {msg.isLoading && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
          {msg.text}
        </p>
        
        {/* 참고자료 토글 버튼과 내용 */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSource(msg.id)}
              className="w-full justify-between p-2 h-auto text-left hover:bg-background/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3" />
                <span className="text-xs font-medium">
                  참고자료 {msg.sources.length}개
                </span>
              </div>
              <div className={`transform transition-transform duration-200 ${
                expandedSources.includes(msg.id) ? 'rotate-180' : ''
              }`}>
                <ChevronDown className="w-3 h-3" />
              </div>
            </Button>
            
            {/* 토글 가능한 참고자료 내용 */}
            {expandedSources.includes(msg.id) && (
              <div className="mt-2 pt-2 border-t border-border/20 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {msg.sources.map((source, index) => (
                  <div 
                    key={index} 
                    className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${
                        source.type === 'consult' ? 'bg-blue-400' : 'bg-green-400'
                      }`} />
                      <span className="text-xs font-medium opacity-90">
                        {source.type === 'consult' ? '상담기록' : '문서'} #{source.file_info}
                      </span>
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">
                      "{source.excerpt}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" aria-hidden="true" />
        <time>{msg.timestamp}</time>
      </div>
    </div>
  </div>
);
  return (
    <>
      {/* FAB 컨테이너 */}
      <div 
        className={`fixed z-50 ${className}`}
        style={{
          right: `${position.x}px`,
          bottom: `${position.y}px`,
        }}
        role="dialog"
        aria-label="AI 챗봇"
      >
        {/* Floating Action Button */}
        {!isOpen && (
          <Button
            onClick={toggleChat}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className={`
              w-18 h-18 rounded-full shadow-lg hover:shadow-xl 
              transition-all duration-300 hover:scale-105 
              bg-primary text-primary-foreground 
              ${isDragging 
                ? 'scale-105 cursor-grabbing opacity-90' 
                : 'cursor-grab hover:opacity-90'
              }
              touch-none select-none lg:w-20 lg:h-20
            `}
            aria-label="AI 챗봇 열기 (드래그하여 이동 가능)"
            title="AI 챗봇 - 고객 정보 검색 및 상담 지원"
          >
            <MessageSquare className="w-9 h-9 lg:w-10 lg:h-10" />
          </Button>
        )}

        {/* 일반 모드 챗봇 패널 */}
        {isOpen && !isFullscreen && (
          <Card className="w-96 h-[600px] shadow-xl rounded-3xl border-border bg-card animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col page-container lg:w-[420px] lg:h-[640px]">

            {/* 헤더 */}
            <CardHeader className="pb-3 border-b border-border shrink-0 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">AI 어시스턴트</CardTitle>
                  <p className="text-xs text-muted-foreground">고객 정보 검색·상담 지원</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 rounded-xl hover:bg-muted transition-colors"
                    aria-label="설정"
                    title="챗봇 설정"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetChat}
                    className="w-8 h-8 rounded-xl hover:bg-muted transition-colors"
                    aria-label="대화 초기화"
                    title="새 대화 시작"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="w-8 h-8 rounded-xl hover:bg-muted transition-colors"
                    aria-label="전체화면으로 확대"
                    title="전체화면 모드"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChat}
                    className="w-8 h-8 rounded-xl hover:bg-muted transition-colors"
                    aria-label="챗봇 닫기"
                    title="챗봇 닫기"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* 메인 채팅 영역 */}
            <div className="flex-1 min-h-0 flex flex-col">
              {/* 대화 스크롤 영역 */}
              <ScrollArea className="flex-1 p-4 scroll-container scrollbar-styled">
                <div className="space-y-4" role="log" aria-label="대화 내역">
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* 빠른 질문 버튼 */}
              <div className="border-t border-border p-3 shrink-0 bg-card">
                <p className="text-xs text-muted-foreground mb-2">빠른 질문:</p>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pb-2" role="group" aria-label="빠른 질문 버튼">
                    {faqPlaceholders.map((faq, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        className="rounded-full text-xs whitespace-nowrap hover:bg-accent transition-colors"
                        onClick={() => handleSendMessage(faq)}
                        aria-label={`빠른 질문: ${faq}`}
                      >
                        {faq}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* 파일 업로드 영역 */}
              {showFileUpload && (
                <div className="border-t border-border p-4 shrink-0 bg-muted/30">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    multiple={true}
                    maxSize={10}
                    className="mb-0"
                  />
                </div>
              )}

              {/* 입력 영역 */}
              <div className="border-t border-border p-4 shrink-0 bg-card rounded-b-3xl">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      placeholder="메시지를 입력하세요..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={isLoading}
                      className="rounded-2xl pr-20 bg-input-background border-input h-11 shadow-sm transition-all duration-200 focus:shadow-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="메시지 입력"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        className="w-7 h-7 p-0 rounded-full hover:bg-muted/80 transition-colors"
                        aria-label="음성 입력"
                        title="음성 입력"
                      >
                        <Mic className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={toggleFileUpload}
                        className={`w-7 h-7 p-0 rounded-full hover:bg-muted/80 transition-colors ${
                          showFileUpload ? 'bg-primary/10 text-primary' : ''
                        }`}
                        aria-label="파일 첨부"
                        title="파일 첨부"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!message.trim() || isLoading}
                    size="sm"
                    className="rounded-2xl w-11 h-11 p-0 shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50"
                    aria-label="메시지 전송"
                    title="메시지 전송 (Enter)"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 전체화면 모드 */}
      {isOpen && isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fullscreen-chatbot-title"
        >
          <Card className="w-full h-full rounded-none shadow-none border-0 bg-background flex flex-col">

            {/* 헤더 */}
            <CardHeader className="pb-4 border-b border-border shrink-0 bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDrawer(true)}
                    className="w-9 h-9 rounded-xl hover:bg-muted transition-colors"
                    aria-label="대화 내역 보기"
                    title="대화 내역 보기"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  <div>
                    <CardTitle id="fullscreen-chatbot-title" className="text-xl font-medium">
                      AI 어시스턴트
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">고객 정보 검색·상담 지원</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-9 h-9 rounded-xl hover:bg-muted transition-colors"
                    aria-label="설정"
                    title="챗봇 설정"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetChat}
                    className="w-9 h-9 rounded-xl hover:bg-muted transition-colors"
                    aria-label="대화 초기화"
                    title="새 대화 시작"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="w-9 h-9 rounded-xl hover:bg-muted transition-colors"
                    aria-label="창 모드로 축소"
                    title="창 모드로 축소"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleChat}
                    className="w-9 h-9 rounded-xl hover:bg-muted transition-colors"
                    aria-label="챗봇 닫기"
                    title="챗봇 닫기"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* 메인 채팅 영역 - 전체 너비 */}
            <div className="flex-1 flex flex-col min-h-0">

                {/* 대화 스크롤 영역 */}
                <ScrollArea className="flex-1 p-6 scroll-container scrollbar-styled">
                  <div className="max-w-4xl mx-auto space-y-6" role="log" aria-label="대화 내역">
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* 빠른 질문 버튼 */}
                <div className="border-t border-border p-4 bg-background">
                  <div className="max-w-4xl mx-auto">
                    <p className="text-sm text-muted-foreground mb-3">빠른 질문:</p>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="빠른 질문 버튼">
                      {faqPlaceholders.map((faq, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                          className="rounded-full text-sm hover:bg-accent transition-colors"
                          onClick={() => handleSendMessage(faq)}
                          aria-label={`빠른 질문: ${faq}`}
                        >
                          {faq}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 파일 업로드 영역 */}
                {showFileUpload && (
                  <div className="border-t border-border p-4 bg-muted/30">
                    <div className="max-w-4xl mx-auto">
                      <FileUpload
                        onFileSelect={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        multiple={true}
                        maxSize={10}
                        className="mb-0"
                      />
                    </div>
                  </div>
                )}

                {/* 입력 영역 */}
                <div className="border-t border-border p-4 bg-background">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          placeholder="메시지를 입력하세요..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyPress}
                          disabled={isLoading}
                          className="rounded-2xl pr-24 bg-input-background border-input h-12 shadow-sm transition-all duration-200 focus:shadow-md focus:ring-2 focus:ring-ring focus:ring-offset-2 text-base"
                          aria-label="메시지 입력"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isLoading}
                            className="w-8 h-8 p-0 rounded-full hover:bg-muted/80 transition-colors"
                            aria-label="음성 입력"
                            title="음성 입력"
                          >
                            <Mic className="w-5 h-5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isLoading}
                            onClick={toggleFileUpload}
                            className={`w-8 h-8 p-0 rounded-full hover:bg-muted/80 transition-colors ${
                              showFileUpload ? 'bg-primary/10 text-primary' : ''
                            }`}
                            aria-label="파일 첨부"
                            title="파일 첨부"
                          >
                            <Paperclip className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={!message.trim() || isLoading}
                        size="sm"
                        className="rounded-2xl w-12 h-12 p-0 shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50"
                        aria-label="메시지 전송"
                        title="메시지 전송 (Enter)"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 드로워 - 대화 내역 */}
            {showDrawer && (
              <div
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                onClick={() => setShowDrawer(false)}
              >
                <div
                  className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm">최근 대화</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDrawer(false)}
                        className="w-8 h-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      새 대화 시작
                    </Button>
                  </div>

                  <ScrollArea className="flex-1 p-2">
                    <div className="space-y-2">
                      {/* 대화 내역 예시 */}
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 text-left"
                        onClick={() => setShowDrawer(false)}
                      >
                        <div>
                          <p className="font-medium text-sm truncate">고객 정보 조회</p>
                          <p className="text-xs text-muted-foreground">방금 전</p>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 text-left"
                        onClick={() => setShowDrawer(false)}
                      >
                        <div>
                          <p className="font-medium text-sm truncate">상담 일정 확인</p>
                          <p className="text-xs text-muted-foreground">1시간 전</p>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 text-left"
                        onClick={() => setShowDrawer(false)}
                      >
                        <div>
                          <p className="font-medium text-sm truncate">계약 현황 문의</p>
                          <p className="text-xs text-muted-foreground">어제</p>
                        </div>
                      </Button>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  }

