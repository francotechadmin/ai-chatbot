'use client';

import type { Session } from 'next-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AccountInfoProps {
  session: Session | null;
}

export function AccountInfo({ session }: AccountInfoProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Email</div>
            <div className="text-sm text-muted-foreground">{session?.user?.email || 'Not available'}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Role</div>
            <div className="text-sm text-muted-foreground capitalize">{session?.user?.role || 'user'}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Account Status</div>
            <div className="text-sm text-muted-foreground capitalize">{session?.user?.status || 'active'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}