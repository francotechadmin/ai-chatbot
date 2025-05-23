'use client';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { ChatHeaderActions } from './chat-header-actions';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';

function PureChatHeader({
  chatId,
  title,
  selectedModelId,
  selectedVisibilityType,
  isReadonly, 
}: {
  chatId: string;
  title?: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 640; // sm breakpoint

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 flex-wrap">
      <SidebarToggle className="order-1" />

      {/* Title - only show on larger screens */}
      {title && (
        <div className="hidden md:block order-2 font-medium truncate max-w-[200px]">
          {title}
        </div>
      )}

      {/* Actions - always visible but responsive */}
      <div className="order-3 md:order-4 ml-auto">
        <ChatHeaderActions 
          chatId={chatId}
          chatTitle={title}
          isMobile={isMobile}
        />
      </div>

      {/* Model selector - conditionally shown */}
      {!isReadonly && (
        <ModelSelector
          selectedModelId={selectedModelId}
          className="order-2 md:order-3 ml-auto md:ml-0"
        />
      )}

      {/* Visibility selector - conditionally shown */}
      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-4 md:order-5"
        />
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
