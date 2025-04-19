'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo, useRef } from 'react';
import { UseChatHelpers } from '@ai-sdk/react';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  chatType?: 'general' | 'query' | 'capture';
}

function PureSuggestedActions({ chatId, append, chatType = 'general' }: SuggestedActionsProps) {
  // Define suggested actions based on chat type
  const getSuggestedActions = () => {
    if (chatType === 'query') {
      return [
        {
          title: 'Find information about',
          label: 'machine learning techniques',
          action: 'Find information about machine learning techniques',
        },
        {
          title: 'Summarize what we know about',
          label: 'climate change impacts',
          action: 'Summarize what we know about climate change impacts',
        },
        {
          title: 'What are the key points from',
          label: 'our product roadmap',
          action: 'What are the key points from our product roadmap',
        },
        {
          title: 'Compare information between',
          label: 'our Q1 and Q2 reports',
          action: 'Compare information between our Q1 and Q2 reports',
        },
      ];
    } else if (chatType === 'capture') {
      return [
        {
          title: 'Document my process for',
          label: 'onboarding new team members',
          action: 'Document my process for onboarding new team members',
        },
        {
          title: 'Create a guide for',
          label: 'using our internal tools',
          action: 'Create a guide for using our internal tools',
        },
        {
          title: 'Help me organize information about',
          label: 'our customer segments',
          action: 'Help me organize information about our customer segments',
        },
        {
          title: 'Structure my notes on',
          label: 'the quarterly planning meeting',
          action: 'Structure my notes on the quarterly planning meeting',
        },
      ];
    } else {
      return [
        {
          title: 'What are the advantages',
          label: 'of using Next.js?',
          action: 'What are the advantages of using Next.js?',
        },
        {
          title: 'Write code to',
          label: `demonstrate djikstra's algorithm`,
          action: `Write code to demonstrate djikstra's algorithm`,
        },
        {
          title: 'Help me write an essay',
          label: `about silicon valley`,
          action: `Help me write an essay about silicon valley`,
        },
        {
          title: 'What is the weather',
          label: 'in San Francisco?',
          action: 'What is the weather in San Francisco?',
        },
      ];
    }
  };

  const suggestedActions = getSuggestedActions();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full overflow-hidden relative max-w-[95vw] mx-auto">
      <div
        ref={scrollContainerRef}
        data-testid="suggested-actions"
        className="flex overflow-x-auto pb-2 gap-1 scrollbar-hide scroll-lock snap-x max-w-full"
        style={{ touchAction: 'pan-x' }}
      >
        {/* Gradient fade on the right side to indicate scrollable content */}
        <div className="sticky right-0 top-0 bottom-0 w-8 ml-auto bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
        
        {suggestedActions.map((suggestedAction, index) => (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.05 * index }}
            key={`suggested-action-${suggestedAction.title}-${index}`}
            className="flex-shrink-0 snap-start w-[140px] md:w-[220px]"
          >
            <Button
              variant="ghost"
              onClick={async () => {
                window.history.replaceState({}, '', `/chat/${chatId}`);

                append({
                  role: 'user',
                  content: suggestedAction.action,
                });
              }}
              className="text-left border rounded-xl px-2 py-2 md:px-4 md:py-3.5 text-xs md:text-sm flex flex-col w-full h-auto justify-start items-start"
            >
              <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full">{suggestedAction.title}</span>
              <span className="text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis w-full">
                {suggestedAction.label}
              </span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions, 
  (prevProps, nextProps) => prevProps.chatType === nextProps.chatType
);
