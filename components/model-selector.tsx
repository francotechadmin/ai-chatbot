'use client';

import { startTransition, useMemo, useOptimistic, useState, useRef, useEffect } from 'react';

import { saveChatModelAsCookie } from '@/app/(dashboard)/query/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon } from './icons';

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollTime = useRef(0);

  // Check if parent container is scrolling
  useEffect(() => {
    const checkScrolling = () => {
      lastScrollTime.current = Date.now();
      setIsScrolling(true);
    };

    // Find the scrollable parent
    const scrollableParent = document.querySelector('.scroll-lock');
    
    if (scrollableParent) {
      scrollableParent.addEventListener('scroll', checkScrolling, { passive: true });
      
      // Reset scrolling state after a delay
      const interval = setInterval(() => {
        if (Date.now() - lastScrollTime.current > 200) {
          setIsScrolling(false);
        }
      }, 100);
      
      return () => {
        scrollableParent.removeEventListener('scroll', checkScrolling);
        clearInterval(interval);
      };
    }
  }, []);

  const selectedChatModel = useMemo(
    () => chatModels.find((chatModel) => chatModel.id === optimisticModelId),
    [optimisticModelId],
  );
  
  // Custom handler for dropdown open/close
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && isScrolling) {
      // Don't open if we're scrolling
      return;
    }
    setOpen(newOpen);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="model-selector"
          variant="outline"
          className="px-2 h-[34px] text-sm"
        >
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {chatModels.map((chatModel) => {
          const { id } = chatModel;

          return (
            <DropdownMenuItem
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setOpen(false);

                startTransition(() => {
                  setOptimisticModelId(id);
                  saveChatModelAsCookie(id);
                });
              }}
              data-active={id === optimisticModelId}
              asChild
            >
              <button
                type="button"
                className="gap-4 group/item flex flex-row justify-between items-center w-full"
              >
                <div className="flex flex-col gap-1 items-start">
                  <div>{chatModel.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {chatModel.description}
                  </div>
                </div>

                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
