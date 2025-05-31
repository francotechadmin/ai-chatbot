import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SettingsLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Settings">
          <Skeleton className="h-10 w-32" />
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Information Skeleton */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Email</div>
                  <Skeleton className="h-5 w-64" />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Role</div>
                  <Skeleton className="h-5 w-32" />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Account Status</div>
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Theme</div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10 col-span-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auth Session Skeleton */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Authentication Session</CardTitle>
              <CardDescription>
                Manage your authentication session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
