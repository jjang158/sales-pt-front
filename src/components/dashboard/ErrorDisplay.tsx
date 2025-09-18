import React from 'react';
import { Button } from '../ui/button';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-medium">데이터 로딩 실패</h3>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <Button onClick={onRetry} className="rounded-xl">
          다시 시도
        </Button>
      </div>
    </div>
  );
}
                        
