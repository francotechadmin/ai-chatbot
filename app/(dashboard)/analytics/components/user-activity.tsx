'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CodeIcon, FileIcon } from '@/components/icons';
import { UserActivity as UserActivityType } from '../types';

interface UserActivityProps {
  data?: UserActivityType[];
}

export function UserActivity({ data }: UserActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity by User</CardTitle>
        <CardDescription>Most active system users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data && data.length > 0 ? (
            data.map((user, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full size-8 bg-muted flex items-center justify-center">{user.initials}</div>
                  <div>
                    <div className="font-medium">{user.email.split('@')[0]}</div>
                    <div className="text-xs text-muted-foreground">{user.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="flex items-center text-sm">
                      <span className="mr-1"><CodeIcon size={14} /></span>
                      <span>{user.queries}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="mr-1"><FileIcon size={14} /></span>
                      <span>{user.captures}</span>
                    </div>
                  </div>
                  <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${user.activityPercentage}%` }} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No user activity data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}