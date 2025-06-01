import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/rbac';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MessageSquare,
  FileText,
  Globe,
  PlusCircle,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getDashboardStats,
  getRecentKnowledgeItems,
  getRecentChats,
} from './actions';
import { formatDate, formatTime } from './utils';

function StatsOverview({
  stats,
}: { stats: Awaited<ReturnType<typeof getDashboardStats>> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="hover:bg-muted/10 transition-colors">
        <a href="/chat" className="block">
          <CardHeader className="pb-2">
            <CardTitle>Total Chats</CardTitle>
            <CardDescription>Conversations with AI</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.totalChats}
          </CardContent>
        </a>
      </Card>
      <Card className="hover:bg-muted/10 transition-colors">
        <a href="/users" className="block">
          <CardHeader className="pb-2">
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Registered accounts</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.totalUsers}
          </CardContent>
        </a>
      </Card>
      <Card className="hover:bg-muted/10 transition-colors">
        <a href="/knowledge-base" className="block">
          <CardHeader className="pb-2">
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>Available documents</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.knowledgeBaseItems}
          </CardContent>
        </a>
      </Card>
      <Card className="hover:bg-muted/10 transition-colors">
        <a href="/knowledge-base" className="block">
          <CardHeader className="pb-2">
            <CardTitle>Pending Review</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.pendingReviewItems}
          </CardContent>
        </a>
      </Card>
    </div>
  );
}

function QuickActions() {
  const quickActions = [
    { name: 'New Chat', icon: <MessageSquare size={16} />, path: '/chat/new' },
    {
      name: 'View Knowledge Base',
      icon: <Globe size={16} />,
      path: '/knowledge-base',
    },
    { name: 'Import Knowledge', icon: <Upload size={16} />, path: '/tools' },
  ];

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {quickActions.map((action) => (
            <Button
              key={`action-${action.path}`}
              variant="outline"
              className="justify-start h-auto py-3 hover:bg-primary/10 transition-colors"
              asChild
            >
              <a href={action.path} className="flex items-center">
                <span className="mr-2 text-primary">{action.icon}</span>
                {action.name}
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentKnowledgeItems({
  items,
}: { items: Awaited<ReturnType<typeof getRecentKnowledgeItems>> }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Knowledge Base Additions</CardTitle>
        <CardDescription>
          Recently added documents and resources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left font-medium">Type</th>
                <th className="py-2 px-4 text-left font-medium">Title</th>
                <th className="py-2 px-4 text-left font-medium">Date</th>
                <th className="py-2 px-4 text-left font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">
                      <span className="flex items-center">
                        <FileText size={16} />
                        <span className="ml-2 capitalize">
                          {item.sourceType}
                        </span>
                      </span>
                    </td>
                    <td className="py-2 px-4 font-medium">
                      <a
                        href={`/knowledge-base/${item.id}`}
                        className="hover:underline text-primary"
                      >
                        {item.title}
                      </a>
                    </td>
                    <td className="py-2 px-4">{formatDate(item.createdAt)}</td>
                    <td className="py-2 px-4">{formatTime(item.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-4 text-center text-muted-foreground"
                  >
                    No knowledge base items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="ml-auto" asChild>
          <a href="/knowledge-base">View All Documents</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

function RecentChats({
  chats,
}: { chats: Awaited<ReturnType<typeof getRecentChats>> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Chats</CardTitle>
        <CardDescription>Latest conversations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center">
                  <MessageSquare size={16} className="mr-2 text-primary" />
                  <a
                    href={`/chat/${chat.id}`}
                    className="font-medium hover:underline text-primary"
                  >
                    {chat.title}
                  </a>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(chat.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              No recent chats found
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="ml-auto" asChild>
          <a href="/chat/new">Start New Chat</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

function LoadingCard() {
  return <div className="h-32 bg-muted/20 animate-pulse rounded-lg" />;
}

export default async function DashboardPage() {
  try {
    // Check authentication
    const session = await auth();

    if (!session || !hasRole(session, 'user')) {
      redirect('/login');
    }

    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-6">
          <PageHeader title="Dashboard">
            <Button>
              <PlusCircle size={16} />
              <span className="ml-2">New Chat</span>
            </Button>
          </PageHeader>

          {/* Stats Overview */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['stats1', 'stats2', 'stats3', 'stats4'].map((id) => (
                  <LoadingCard key={id} />
                ))}
              </div>
            }
          >
            <StatsOverview stats={await getDashboardStats()} />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Suspense fallback={<LoadingCard />}>
              <QuickActions />
            </Suspense>

            {/* Recent Knowledge Base Additions */}
            <Suspense
              fallback={
                <div className="lg:col-span-2">
                  <LoadingCard />
                </div>
              }
            >
              <RecentKnowledgeItems items={await getRecentKnowledgeItems()} />
            </Suspense>
          </div>

          {/* Recent Chats */}
          <Suspense fallback={<LoadingCard />}>
            <RecentChats chats={await getRecentChats()} />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in DashboardPage:', error);
    throw error; // This will be caught by the error.tsx boundary
  }
}
