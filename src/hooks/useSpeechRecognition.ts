import { useState, useRef, useCallback, useEffect } from 'react';

// Web Speech API 타입 정의
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEventType extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventType extends Event {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  
  start(): void;
  stop(): void;
  abort(): void;
  
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEventType) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEventType) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEventType) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare const SpeechRecognition: {
  new (): SpeechRecognition;
};

export interface SpeechRecognitionState {
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  confidence: number;
  error: string | null;
}

export interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onTranscriptUpdate?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const {
    lang = 'ko-KR',
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
    onTranscriptUpdate,
    onError,
    onStart,
    onEnd
  } = options;

  // State
  const [state, setState] = useState<SpeechRecognitionState>({
    transcript: '',
    interimTranscript: '',
    finalTranscript: '',
    isListening: false,
    isSupported: false,
    confidence: 0,
    error: null
  });

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isManualStop = useRef(false);
  const callbacksRef = useRef({
    onTranscriptUpdate,
    onError,
    onStart,
    onEnd
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onTranscriptUpdate,
      onError,
      onStart,
      onEnd
    };
  }, [onTranscriptUpdate, onError, onStart, onEnd]);

  // Check browser support
  const checkSupport = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: 'Speech Recognition is not supported in this browser'
      }));
      return null;
    }

    const recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;

    // Event handlers
    recognition.onstart = () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        error: null
      }));
      callbacksRef.current.onStart?.();
    };

    recognition.onresult = (event: SpeechRecognitionEventType) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0;

        if (result.isFinal) {
          finalTranscript += transcript + ' ';
          maxConfidence = Math.max(maxConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      // Update state
      setState(prev => {
        const newFinalTranscript = prev.finalTranscript + finalTranscript;
        const fullTranscript = newFinalTranscript + interimTranscript;

        // Call callback with updated transcript
        callbacksRef.current.onTranscriptUpdate?.(fullTranscript, finalTranscript.length > 0);

        return {
          ...prev,
          transcript: fullTranscript,
          interimTranscript,
          finalTranscript: newFinalTranscript,
          confidence: maxConfidence || prev.confidence
        };
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventType) => {
      let errorMessage = 'Speech recognition error occurred';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = '음성이 감지되지 않았습니다. 마이크를 확인해주세요.';
          break;
        case 'audio-capture':
          errorMessage = '오디오 캡처에 실패했습니다. 마이크 권한을 확인해주세요.';
          break;
        case 'not-allowed':
          errorMessage = '마이크 접근 권한이 거부되었습니다.';
          break;
        case 'network':
          errorMessage = '네트워크 오류가 발생했습니다.';
          break;
        case 'service-not-allowed':
          errorMessage = '음성 인식 서비스가 허용되지 않습니다.';
          break;
        case 'bad-grammar':
          errorMessage = '음성 인식 문법 오류가 발생했습니다.';
          break;
        case 'language-not-supported':
          errorMessage = '지원되지 않는 언어입니다.';
          break;
        default:
          errorMessage = `음성 인식 오류: ${event.error}`;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isListening: false
      }));
      
      callbacksRef.current.onError?.(errorMessage);
    };

    recognition.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false
      }));
      
      callbacksRef.current.onEnd?.();

      // Auto-restart if continuous and not manually stopped
      if (continuous && !isManualStop.current) {
        setTimeout(() => {
          if (recognitionRef.current && !isManualStop.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.warn('Failed to restart speech recognition:', error);
            }
          }
        }, 100);
      }
    };

    recognition.onnomatch = () => {
      console.warn('Speech recognition: no match found');
    };

    return recognition;
  }, [lang, continuous, interimResults, maxAlternatives]);

  // Start listening
  const startListening = useCallback(() => {
    if (!checkSupport()) {
      setState(prev => ({
        ...prev,
        error: 'Speech Recognition is not supported in this browser'
      }));
      return;
    }

    try {
      isManualStop.current = false;
      
      if (!recognitionRef.current) {
        recognitionRef.current = initializeRecognition();
      }

      if (recognitionRef.current && !state.isListening) {
        recognitionRef.current.start();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start speech recognition';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      callbacksRef.current.onError?.(errorMessage);
    }
  }, [checkSupport, initializeRecognition, state.isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    isManualStop.current = true;
    
    if (recognitionRef.current && state.isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn('Error stopping speech recognition:', error);
      }
    }
  }, [state.isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      finalTranscript: '',
      confidence: 0,
      error: null
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // Get supported languages (static method)
  const getSupportedLanguages = useCallback(() => {
    return [
      { code: 'ko-KR', name: '한국어' },
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'ja-JP', name: '日本語' },
      { code: 'zh-CN', name: '中文 (简体)' },
      { code: 'zh-TW', name: '中文 (繁體)' },
      { code: 'es-ES', name: 'Español' },
      { code: 'fr-FR', name: 'Français' },
      { code: 'de-DE', name: 'Deutsch' },
      { code: 'it-IT', name: 'Italiano' }
    ];
  }, []);

  // Initialize support check
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isSupported: checkSupport()
    }));
  }, [checkSupport]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isManualStop.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current = null;
        } catch (error) {
          console.warn('Cleanup error:', error);
        }
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
    getSupportedLanguages,
    // Utility functions
    hasTranscript: state.transcript.length > 0,
    wordCount: state.transcript.trim().split(/\s+/).filter(word => word.length > 0).length,
    // Format transcript with basic punctuation
    getFormattedTranscript: () => {
      return state.transcript
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/([.!?])\s*([가-힣a-zA-Z])/g, '$1 $2')
        .replace(/^[가-힣a-zA-Z]/, match => match.toUpperCase());
    }
  };
}