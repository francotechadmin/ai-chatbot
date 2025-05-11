import { motion } from 'framer-motion';
import Link from 'next/link';

import { MessageIcon, VercelIcon } from './icons';

interface OverviewProps {
  chatType?: 'general' | 'query' | 'capture';
}

export const Overview = ({ chatType = 'general' }: OverviewProps) => {
  const renderContent = () => {
    if (chatType === 'query') {
      return (
        <>
          <p className="flex flex-row justify-center gap-4 items-center">
            <MessageIcon size={32} />
          </p>
          <p>
            <strong>Knowledge Query Assistant</strong> helps you find and understand information from your knowledge base.
          </p>
        </>
      );
    } else if (chatType === 'capture') {
      return (
        <>
          <p className="flex flex-row justify-center gap-4 items-center">
            <MessageIcon size={32} />
          </p>
          <p>
            <strong>Knowledge Capture Assistant</strong> helps you document, organize, and structure your knowledge.
          </p>
          <p>
            Try requests like:
          </p>
          <ul className="list-disc list-inside text-left">
            <li>Document my process for [task]</li>
            <li>Help me organize information about [topic]</li>
          </ul>
        </>
      );
    } else {
      return (
        <>
          <p className="flex flex-row justify-center gap-4 items-center">
            <VercelIcon size={32} />
            <span>+</span>
            <MessageIcon size={32} />
          </p>
          <p>
            This is an{' '}
            <Link
              className="font-medium underline underline-offset-4"
              href="https://github.com/vercel/ai-chatbot"
              target="_blank"
            >
              open source
            </Link>{' '}
            chatbot template built with Next.js and the AI SDK by Vercel. It uses
            the{' '}
            <code className="rounded-md bg-muted px-1 py-0.5">streamText</code>{' '}
            function in the server and the{' '}
            <code className="rounded-md bg-muted px-1 py-0.5">useChat</code> hook
            on the client to create a seamless chat experience.
          </p>
          <p>
            You can learn more about the AI SDK by visiting the{' '}
            <Link
              className="font-medium underline underline-offset-4"
              href="https://sdk.vercel.ai/docs"
              target="_blank"
            >
              docs
            </Link>
            .
          </p>
        </>
      );
    }
  };

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto "
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-4 md:p-6 flex flex-col gap-4 md:gap-8 leading-relaxed text-center w-full max-w-xl mx-auto">
        {renderContent()}
      </div>
    </motion.div>
  );
};
