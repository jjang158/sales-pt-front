import React from 'react';
import { useIsMobile } from './use-mobile';

interface StyledContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'orange' | 'green' | 'blue' | 'purple';
}

export function StyledContainer({
  children,
  className = '',
  variant = 'default'
}: StyledContainerProps) {
  const isMobile = useIsMobile();

  const getVariantStyles = () => {
    switch (variant) {
      case 'orange':
        return 'bg-gradient-to-br from-orange-200 to-orange-300';
      case 'green':
        return 'bg-gradient-to-br from-green-200 to-green-300';
      case 'blue':
        return 'bg-gradient-to-br from-blue-200 to-blue-300';
      case 'purple':
        return 'bg-gradient-to-br from-purple-200 to-purple-300';
      default:
        return 'bg-gradient-to-br from-amber-200 to-orange-300';
    }
  };

  return (
    <div
      className={`
        ${isMobile ? 'w-full h-[85vh]' : 'w-96 h-[70vh]'}
        ${getVariantStyles()}
        rounded-3xl
        flex flex-col justify-end
        overflow-hidden
        shadow-lg
        ${className}
      `}
      style={{
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
      }}
    >
      {children}
    </div>
  );
}