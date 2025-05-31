'use client';

import { type ReactNode, useRef } from 'react';

interface PageHeaderProps {
  title?: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
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
        <div className="gap-2 flex items-center">{children}</div>
      </div>
    </div>
  );
}
