'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageIcon } from '@/components/icons';

export default function PendingApprovalPage() {
  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Account Pending Approval</CardTitle>
          <CardDescription>Your account is awaiting administrator approval</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            <MessageIcon size={40} />
          </div>
          <div className="space-y-2">
            <p>
              Thank you for registering! Your account has been created but requires administrator approval before you can access the system.
            </p>
            <p className="text-sm text-muted-foreground">
              You will be notified via email once your account has been approved. This process typically takes 1-2 business days.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/login">Return to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
