'use client';

import { useState, useEffect } from 'react';
import { formatDistance, format } from 'date-fns';
import type { Chat } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontalIcon, ShareIcon, TrashIcon, SearchIcon } from '@/components/icons';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import useSWR from 'swr';
import { toast } from 'sonner';
import { fetcher } from '@/lib/utils';

export function HistoryPanel({ 
  defaultType = 'all',
  onSelect,
  onClose 
}: { 
  defaultType?: 'all' | 'query' | 'capture';
  onSelect?: (chatId: string) => void;
  onClose?: () => void;
}) {
  // State for active tab
  const [activeType, setActiveType] = useState<'all' | 'query' | 'capture'>(defaultType);
  
  // Type for the tab value
  type TabValue = 'all' | 'query' | 'capture';
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for sorting
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  // Fetch all chats
  const { data: allChats, mutate } = useSWR<Array<Chat>>(
    '/api/history',
    fetcher,
    { fallbackData: [] }
  );
  
  // Filter chats based on active type and search query
  const filteredChats = allChats?.filter(chat => {
    // Filter by type
    if (activeType !== 'all' && chat.type !== activeType) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !chat.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  }) || [];
  
  // Sort chats
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });
  
  // Delete functionality
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/chat?id=${deleteId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        mutate(allChats?.filter(chat => chat.id !== deleteId));
        toast.success('Conversation deleted successfully');
      } else {
        toast.error('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete conversation');
    }
    
    setShowDeleteDialog(false);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Conversation History</h2>
        
        {/* Search input */}
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <SearchIcon />
          </div>
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Buttons for filtering by type */}
        <div className="flex w-full border rounded-md overflow-hidden">
          <Button 
            variant={activeType === 'all' ? 'default' : 'ghost'} 
            className="flex-1 rounded-none"
            onClick={() => setActiveType('all')}
          >
            All
          </Button>
          <Button 
            variant={activeType === 'query' ? 'default' : 'ghost'} 
            className="flex-1 rounded-none"
            onClick={() => setActiveType('query')}
          >
            Queries
          </Button>
          <Button 
            variant={activeType === 'capture' ? 'default' : 'ghost'} 
            className="flex-1 rounded-none"
            onClick={() => setActiveType('capture')}
          >
            Captures
          </Button>
        </div>
        
        {/* Sort control */}
        <div className="flex justify-end mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
          >
            Sort: {sortBy === 'newest' ? 'Newest first' : 'Oldest first'}
          </Button>
        </div>
      </div>
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {sortedChats.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No conversations found
          </div>
        ) : (
          <div className="divide-y">
            {sortedChats.map((chat) => (
              <div key={chat.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div 
                    className="flex-1 min-w-0 cursor-pointer" 
                    onClick={() => {
                      if (onSelect) {
                        onSelect(chat.id);
                      } else {
                        const baseUrl = chat.type === 'query' ? '/query/' : 
                                       chat.type === 'capture' ? '/capture/' : 
                                       '/';
                        window.location.href = `${baseUrl}${chat.id}`;
                      }
                      if (onClose) onClose();
                    }}
                  >
                    <h3 className="font-medium truncate">{chat.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(chat.createdAt), 'MMM d, yyyy')} · {' '}
                      {formatDistance(new Date(chat.createdAt), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontalIcon size={16} />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link 
                          href={`/${chat.type === 'query' ? 'query' : chat.type === 'capture' ? 'capture' : ''}/${chat.id}`} 
                          className="cursor-pointer"
                          onClick={() => {
                            if (onClose) onClose();
                          }}
                        >
                          <span className="mr-2">→</span>
                          <span>Continue</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ShareIcon size={16} />
                        <span className="ml-2">Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setDeleteId(chat.id);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <TrashIcon size={16} />
                        <span className="ml-2">Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              conversation and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
