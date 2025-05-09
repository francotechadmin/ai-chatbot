'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { chatModels, DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { saveChatModelAsCookie } from '@/app/(dashboard)/query/actions';
import { saveDefaultVisibilityAsCookie } from './actions';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_CHAT_MODEL);
  const [defaultVisibility, setDefaultVisibility] = useState<'private' | 'public'>('private');
  
  // Load saved preferences from cookies on component mount
  useEffect(() => {
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    // Load saved model
    const savedModel = getCookieValue('chat-model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    
    // Load saved visibility preference
    const savedVisibility = getCookieValue('default-visibility');
    if (savedVisibility && (savedVisibility === 'private' || savedVisibility === 'public')) {
      setDefaultVisibility(savedVisibility);
    }
  }, []);
  
  const handleSave = async () => {
    try {
      // Save model selection to cookie
      await saveChatModelAsCookie(selectedModel);
      
      // Save visibility preference to cookie
      await saveDefaultVisibilityAsCookie(defaultVisibility);
            
      // Show success message
      toast.success('Settings saved successfully');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <PageHeader title='Settings'>
          <Button onClick={handleSave}>
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Information */}
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

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Theme</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={theme === 'light' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setTheme('light')}
                  >
                    Light
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setTheme('dark')}
                  >
                    Dark
                  </Button>
                  <Button 
                    variant={theme === 'system' ? 'default' : 'outline'} 
                    className="justify-start col-span-2"
                    onClick={() => setTheme('system')}
                  >
                    System Default
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Defaults */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Chat Defaults</CardTitle>
              <CardDescription>Configure default settings for new chats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Default AI Model</div>
                  <select 
                    id="default-model" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    {chatModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Default Content Visibility</div>
                  <select 
                    id="default-visibility" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={defaultVisibility}
                    onChange={(e) => setDefaultVisibility(e.target.value as 'private' | 'public')}
                  >
                    <option value="private">Private - Only you can access</option>
                    <option value="public">Public - Anyone with the link can access</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* aauth session */}
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
        </div>
      </div>
    </div>
  );
}
