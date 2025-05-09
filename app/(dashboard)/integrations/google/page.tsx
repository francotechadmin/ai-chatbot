'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function GoogleIntegrationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // Show success message if redirected from OAuth callback
    if (status === 'success') {
      setMessage('Google Drive connected successfully!');
    }
    
    // Check if integration exists when the component mounts
    checkIntegration();
  }, [status]);

  const checkIntegration = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/integrations/google/status');
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
        setUserInfo(data.user);
        
        if (data.connected) {
          setMessage('Google Drive integration is active.');
        }
      } else {
        setError('Failed to check integration status.');
      }
    } catch (err) {
      setError('Failed to check integration status.');
    } finally {
      setIsLoading(false);
    }
  };

  const connectToGoogle = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/integrations/google/auth/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (response.ok) {
        const { url } = await response.json();
        // Redirect to Google's OAuth page
        window.location.href = url;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to connect to Google Drive.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to connect to Google Drive.');
      setIsLoading(false);
    }
  };

  const disconnectGoogle = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/integrations/google/auth/disconnect', {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsConnected(false);
        setUserInfo(null);
        setMessage('Google Drive integration has been disconnected.');
      } else {
        setError('Failed to disconnect from Google Drive.');
      }
    } catch (err) {
      setError('Failed to disconnect from Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Google Drive Integration">
          {!isConnected && (
            <Button onClick={() => connectToGoogle()} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Connecting...
                </>
              ) : (
                'Connect with Default Credentials'
              )}
            </Button>
          )}
          {isConnected && (
            <Button variant="outline" onClick={disconnectGoogle} disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2 size-4" /> : null}
              Disconnect
            </Button>
          )}
        </PageHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {isConnected ? (
          <Card>
            <CardHeader>
              <CardTitle>Google Drive Documents</CardTitle>
              <CardDescription>
                Browse and import documents from your Google Drive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userInfo && (
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Connected as:</p>
                    <div className="flex items-center gap-2 mt-1">
                      {userInfo.picture && (
                        <Image
                          src={userInfo.picture}
                          alt={userInfo.name}
                          width={32}
                          height={32}
                          className="size-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{userInfo.name}</p>
                        <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="text-center py-4">
                  <p className="mb-4">Access documents from your Google Drive and import them to your knowledge base.</p>
                  <Button onClick={() => router.push('/integrations/google/drive')}>
                    Browse Google Drive
                  </Button>
                </div>
                
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Google Drive Integration</CardTitle>
              <CardDescription>
                Connect to Google Drive to import documents to your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="size-10 flex items-center justify-center bg-red-100 text-red-800 rounded-full">
                      GD
                    </div>
                    <div>
                      <h3 className="font-medium">Google Drive</h3>
                      <p className="text-sm text-muted-foreground">Import documents from your Google Drive</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="size-10 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full">
                      GD
                    </div>
                    <div>
                      <h3 className="font-medium">Google Docs</h3>
                      <p className="text-sm text-muted-foreground">Import Google Docs directly into your knowledge base</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => connectToGoogle()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    Connecting...
                  </>
                ) : (
                  'Connect to Google Drive'
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}