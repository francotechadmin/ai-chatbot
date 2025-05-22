'use client';

import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/icons';

export function NewQueryButton() {
  return (
    <Button 
      variant="outline" 
      onClick={() => {}}
      className="w-full h-[34px] text-sm"
      asChild
    >
      <a href="/query/new">
        <PlusIcon size={16} />
        <span className="ml-2">New Query</span>
      </a>
    </Button>
  );
}