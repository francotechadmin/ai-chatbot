'use client';

import type { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AuthSessionProps {
  session: Session | null;
}

export function AuthSession({ session }: AuthSessionProps) {
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Authentication Session</CardTitle>
        <CardDescription>Manage your authentication session</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {session ? (
            <div className="flex flex-col items-start">
              You are logged in as {session.user.email}. 
              <Button variant="destructive" className="mt-4" onClick={() => signOut()}>Sign Out</Button>
            </div>
          ) : (
            'You are not logged in. Please log in to access your account.'
          )}
        </div>
      </CardContent>
    </Card>
  );
}