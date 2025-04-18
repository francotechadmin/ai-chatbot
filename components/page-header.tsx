'use client';

import { ReactNode } from 'react';
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

  return (
    <div className="flex flex-col justify-between items-start gap-4 md:flex-row md:items-center mb-4">
      <h1 className="text-2xl font-bold flex items-center gap-2 cursor-pointer" onClick={toggleSidebar}>
        <span className="text-muted-foreground">
          <SidebarLeftIcon size={24} />
        </span>
        <span className="truncate max-w-[200px] md:max-w-none">{title}</span>
      </h1>
      <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
        {showModelSelector && selectedModelId && !isReadonly && (
          <ModelSelector
            selectedModelId={selectedModelId}
            className="mr-2"
          />
        )}
        
        {showVisibilitySelector && chatId && selectedVisibilityType && !isReadonly && (
          <VisibilitySelector
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
          />
        )}
        
        {children}
      </div>
    </div>
  );
}
