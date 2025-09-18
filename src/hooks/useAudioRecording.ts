import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioLevel: number;
  audioBlob: Blob | null;
  error: string | null;
}

export interface AudioRecordingControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}

export interface UseAudioRecordingOptions {
  onRecordingComplete?: (blob: Blob) => void;
  onError?: (error: string) => void;
  audioConstraints?: MediaTrackConstraints;
}

export function useAudioRecording(options: UseAudioRecordingOptions = {}) {
  const {
    onRecordingComplete,
    onError,
    audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
    }
  } = options;

  // State
  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    audioLevel: 0,
    audioBlob: null,
    error: null,
  });

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Audio level monitoring
  // monitorAudioLevel을 useRef로 관리
const monitorAudioLevel = useCallback(() => {
  if (!analyserRef.current) return;

  const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
  analyserRef.current.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i] * dataArray[i];
  }
  const rms = Math.sqrt(sum / dataArray.length);
  const audioLevel = (rms / 255) * 100;

  setState(prev => {
    if (prev.isRecording && !prev.isPaused) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }
    return { ...prev, audioLevel };
  });
}, []); // 의존성 배열 제거

  // Timer for recording duration
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        recordingTime: prev.recordingTime + 1
      }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Initialize audio context and analyser
  const setupAudioAnalysis = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start monitoring audio levels
      monitorAudioLevel();
    } catch (error) {
      console.error('Failed to setup audio analysis:', error);
    }
  }, [monitorAudioLevel]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints
      });

      streamRef.current = stream;

      // Setup audio analysis
      setupAudioAnalysis(stream);

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType
        });

        setState(prev => ({ ...prev, audioBlob }));
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second

      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        recordingTime: 0
      }));

      startTimer();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [audioConstraints, setupAudioAnalysis, startTimer, onRecordingComplete, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      
      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        audioLevel: 0
      }));

      stopTimer();

      // Stop animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Clean up stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  }, [state.isRecording, stopTimer]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true, audioLevel: 0 }));
      stopTimer();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [state.isRecording, state.isPaused, stopTimer]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
      startTimer();
      monitorAudioLevel();
    }
  }, [state.isRecording, state.isPaused, startTimer, monitorAudioLevel]);

  // Reset recording
  const resetRecording = useCallback(() => {
    stopRecording();
    setState(prev => ({
      ...prev,
      recordingTime: 0,
      audioBlob: null,
      error: null
    }));
    audioChunksRef.current = [];
  }, [stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get file size estimate
  const getFileSize = useCallback(() => {
    if (state.audioBlob) {
      const sizeInMB = state.audioBlob.size / (1024 * 1024);
      return sizeInMB < 1 
        ? `${Math.round(sizeInMB * 1024)} KB` 
        : `${sizeInMB.toFixed(1)} MB`;
    }
    
    // Estimate based on recording time (roughly 1MB per minute for decent quality)
    const estimatedSizeInMB = (state.recordingTime / 60) * 1.2;
    return estimatedSizeInMB < 1 
      ? `${Math.round(estimatedSizeInMB * 1024)} KB` 
      : `${estimatedSizeInMB.toFixed(1)} MB`;
  }, [state.audioBlob, state.recordingTime]);

  const checkBrowserSupport = useCallback(() => {
  try {
    return !!(
      'mediaDevices' in navigator &&
      'getUserMedia' in navigator.mediaDevices &&
      'MediaRecorder' in window
    );
  } catch {
    return false;
  }
}, []);

const isSupported = checkBrowserSupport();

  const controls: AudioRecordingControls = {
    startRecording,
    stopRecording,
    pauseRecording: pauseRecording,
    resumeRecording,
    resetRecording,
  };

  return {
    ...state,
    ...controls,
    formatTime,
    getFileSize,
    isSupported,
  };
}