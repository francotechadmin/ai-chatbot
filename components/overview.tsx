import { motion } from 'framer-motion';
import { MessageIcon } from './icons';

export const Overview = () => {
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
        <>
          <p className="flex flex-row justify-center gap-4 items-center">
            <MessageIcon size={32} />
          </p>
          <p>
            <strong> Knowledge Assistant</strong> helps you both find information and document your knowledge.
          </p>
        </>
      </div>
    </motion.div>
  );
};
