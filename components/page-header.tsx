'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { SidebarLeftIcon } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex flex-col justify-between items-center gap-8 md:flex-row mb-4">
      <h1 className="text-3xl font-bold flex self-start items-center gap-2 cursor-pointer" onClick={toggleSidebar}>
        <span 
          className="text-muted-foreground " 

        >
          <SidebarLeftIcon size={24} />
        </span>
        {title}
      </h1>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}