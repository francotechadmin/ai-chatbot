'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';
import { Spinner } from '@/components/ui/spinner';

export default function MicrosoftIntegrationsPage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('sharepoint');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // Form for user-provided credentials
  const [clientId, setClientId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Check if integration exists when the component mounts
    async function checkIntegration() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/integrations/microsoft/status');
        
        if (response.ok) {
          const data = await response.json();
          setIsConnected(data.connected);
          
          if (data.connected) {
            setMessage('Microsoft 365 integration is active.');
          }
        } else {
          setError('Failed to check integration status.');
        }
      } catch (err) {
        setError('Failed to check integration status.');
      } finally {
        setIsLoading(false);
      }
    }

    checkIntegration();
  }, []);

  const connectToMicrosoft = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Include user-provided credentials if they're using custom credentials
      const credentials = clientId && clientSecret ? {
        clientId,
        clientSecret,
      } : undefined;
      
      const response = await fetch('/api/integrations/microsoft/auth/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credentials }),
      });
      
      if (response.ok) {
        const { url } = await response.json();
        // Redirect to Microsoft's OAuth page
        window.location.href = url;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to connect to Microsoft.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to connect to Microsoft.');
      setIsLoading(false);
    }
  };

  const disconnectMicrosoft = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/integrations/microsoft/disconnect', {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsConnected(false);
        setMessage('Microsoft integration has been disconnected.');
      } else {
        setError('Failed to disconnect from Microsoft.');
      }
    } catch (err) {
      setError('Failed to disconnect from Microsoft.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title="Microsoft 365 Integration">
          {!isConnected && (
            <Button onClick={() => connectToMicrosoft()} disabled={isLoading || (!clientId || !clientSecret)}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Connecting...
                </>
              ) : (
                'Connect to Microsoft 365'
              )}
            </Button>
          )}
          {isConnected && (
            <Button variant="outline" onClick={disconnectMicrosoft} disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Disconnect
            </Button>
          )}
        </PageHeader>

        {/* {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert>
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )} */}

        {isConnected ? (
          <Tabs defaultValue="sharepoint" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sharepoint">SharePoint</TabsTrigger>
              <TabsTrigger value="onedrive">OneDrive</TabsTrigger>
            </TabsList>
            <TabsContent value="sharepoint">
              <Card>
                <CardHeader>
                  <CardTitle>SharePoint Documents</CardTitle>
                  <CardDescription>
                    Browse and import documents from SharePoint sites
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="mb-4">Access documents from your organization&apos;s SharePoint sites.</p>
                    <Button onClick={() => router.push('/integrations/microsoft/sharepoint')}>
                      Browse SharePoint
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="onedrive">
              <Card>
                <CardHeader>
                  <CardTitle>OneDrive Files</CardTitle>
                  <CardDescription>
                    Browse and import files from your OneDrive
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="mb-4">Access files from your personal OneDrive.</p>
                    <Button onClick={() => router.push('/integrations/microsoft/onedrive')}>
                      Browse OneDrive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Microsoft 365 Integration</CardTitle>
              <CardDescription>
                Connect to Microsoft 365 to import documents from SharePoint and OneDrive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <form onSubmit={connectToMicrosoft} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Application (Client) ID</Label>
                    <Input
                      id="clientId"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Enter your Microsoft Application ID"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      You can find this in the Azure Portal under App registrations.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="Enter your Microsoft Client Secret"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      You can create this in the Azure Portal under Certificates & secrets.
                    </p>
                  </div>
                </form>

                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full">
                      SP
                    </div>
                    <div>
                      <h3 className="font-medium">SharePoint</h3>
                      <p className="text-sm text-muted-foreground">Access team documents and knowledge repositories</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full">
                      OD
                    </div>
                    <div>
                      <h3 className="font-medium">OneDrive</h3>
                      <p className="text-sm text-muted-foreground">Import your personal documents and files</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => connectToMicrosoft()} 
                disabled={isLoading || (!clientId || !clientSecret)}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Connecting...
                  </>
                ) : (
                  'Connect to Microsoft 365'
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}