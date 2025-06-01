import { PageHeader } from '@/components/page-header';

function LoadingCard() {
  return <div className="h-32 bg-muted/20 animate-pulse rounded-lg" />;
}

export default function DashboardLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard">
          <div className="h-10 w-32 bg-muted/20 animate-pulse rounded-lg" />
          <div className="h-10 w-32 bg-muted/20 animate-pulse rounded-lg" />
        </PageHeader>

        {/* Stats Overview Loading */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['stats1', 'stats2', 'stats3', 'stats4'].map((id) => (
            <LoadingCard key={id} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Loading */}
          <LoadingCard />

          {/* Recent Knowledge Base Additions Loading */}
          <div className="lg:col-span-2">
            <LoadingCard />
          </div>
        </div>

        {/* Recent Chats Loading */}
        <LoadingCard />
      </div>
    </div>
  );
}
