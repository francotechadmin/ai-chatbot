'use client';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistance } from 'date-fns';
import { PlusIcon, FileIcon } from '@/components/icons';
import { useEffect, useState } from 'react';
import type { Chat } from '@/lib/db/schema';

export default function CapturePage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      try {
        const response = await fetch('/api/history?type=capture');
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChats();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Knowledge Capture">
          <Button asChild>
            <Link href="/capture/chat/new">
              <PlusIcon size={16} />
              <span className="ml-2">New Capture</span>
            </Link>
          </Button>
        </PageHeader>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-pulse h-8 w-32 bg-muted rounded"></div>
          </div>
        ) : chats.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="text-muted-foreground mb-4">
                <FileIcon size={48} />
              </div>
              <p className="text-muted-foreground text-center mb-4">
                You haven&apos;t created any knowledge captures yet.
              </p>
              <Button asChild>
                <Link href="/capture/chat/new">
                  <PlusIcon size={16} />
                  <span className="ml-2">Start a New Capture</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chats.map((chat) => (
              <Card key={chat.id} className="hover:bg-muted/50 transition-colors">
                <Link href={`/capture/chat/${chat.id}`} className="block h-full">
                  <CardHeader>
                    <CardTitle className="truncate">{chat.title}</CardTitle>
                    <CardDescription>
                      {formatDistance(new Date(chat.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
