import React from 'react';
import { Edit, RotateCcw, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface TranscriptEditorProps {
  transcript: string;
  originalTranscript: string;
  isAnalyzing: boolean;
  onTranscriptChange: (value: string) => void;
  onReanalyze: () => void;
  onRevert: () => void;
}

export function TranscriptEditor({
  transcript,
  originalTranscript,
  isAnalyzing,
  onTranscriptChange,
  onReanalyze,
  onRevert
}: TranscriptEditorProps) {
  return (
    <Card className="rounded-2xl shadow-sm flex-1 flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            전사 내용 편집
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl"
              onClick={onReanalyze}
              disabled={isAnalyzing || !transcript.trim()}
            >
              <Brain className="w-4 h-4 mr-1" />
              AI 재분석
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl"
              onClick={onRevert}
              disabled={transcript === originalTranscript}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              되돌리기
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-shrink-0 p-4 border-t bg-muted/20">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {transcript.trim().split(/\s+/).filter(word => word.length > 0).length} 단어
            </span>
            <span>
              {transcript.length} 글자
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}