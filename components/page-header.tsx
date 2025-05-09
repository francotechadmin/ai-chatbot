'use client';

import { ReactNode, useRef } from 'react';
import { ModelSelector } from '@/components/model-selector';

interface PageHeaderProps {
  title?: string;
  children?: ReactNode;
  selectedModelId?: string;
  showModelSelector?: boolean;
  isReadonly?: boolean;
}

export function PageHeader({ 
  title,
  children, 
  selectedModelId,
  showModelSelector = false,
  isReadonly = false
}: PageHeaderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="flex flex-col justify-between items-start gap-4 md:flex-row md:items-center mb-4">
      <h1 className="text-2xl font-bold flex items-center gap-2 cursor-pointer">
        <span className="truncate max-w-[90vw] md:max-w-none">{title}</span>
      </h1>
      <div 
        ref={scrollContainerRef}
        className="flex place-items-center overflow-x-auto scrollbar-hide scroll-lock pb-2 pr-8 gap-2 w-full md:w-auto relative"
        style={{ touchAction: 'pan-x' }}
      >
        <div className="gap-2 flex items-center">
          {children}
        </div>
        {showModelSelector && selectedModelId && !isReadonly && (
          <div className="shrink-0 w-[140px] md:w-auto">
            <ModelSelector
              selectedModelId={selectedModelId}
              className="mr-2 w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
