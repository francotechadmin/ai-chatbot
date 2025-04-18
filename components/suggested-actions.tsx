'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
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

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
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
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions, 
  (prevProps, nextProps) => prevProps.chatType === nextProps.chatType
);
