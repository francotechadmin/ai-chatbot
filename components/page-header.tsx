'use client';

import { ReactNode, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { SidebarLeftIcon } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { ModelSelector } from '@/components/model-selector';
import { VisibilitySelector } from '@/components/visibility-selector';
import { VisibilityType } from '@/components/visibility-selector';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
  chatId?: string;
  selectedModelId?: string;
  selectedVisibilityType?: VisibilityType;
  showModelSelector?: boolean;
  showVisibilitySelector?: boolean;
  isReadonly?: boolean;
}

export function PageHeader({ 
  title, 
  children, 
  chatId,
  selectedModelId,
  selectedVisibilityType,
  showModelSelector = false,
  showVisibilitySelector = false,
  isReadonly = false
}: PageHeaderProps) {
  const { toggleSidebar } = useSidebar();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="flex flex-col justify-between items-start gap-4 md:flex-row md:items-center mb-4">
      <h1 className="text-2xl font-bold flex items-center gap-2 cursor-pointer" onClick={toggleSidebar}>
        <span className="text-muted-foreground">
          <SidebarLeftIcon size={24} />
        </span>
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
        
        {showVisibilitySelector && chatId && selectedVisibilityType && !isReadonly && (
          <div className="shrink-0 w-[140px] md:w-auto">
            <VisibilitySelector
              chatId={chatId}
              selectedVisibilityType={selectedVisibilityType}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
