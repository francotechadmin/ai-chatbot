'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          {/* General Settings */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your system preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input id="app-name" defaultValue="Knowledge Management System" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-model">Default AI Model</Label>
                <select id="default-model" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5">GPT-3.5</option>
                  <option value="claude-3">Claude 3</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-visibility">Default Content Visibility</Label>
                  <select id="default-visibility" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="private">Private</option>
                    <option value="team">Team</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Tokens per Query</Label>
                  <Input type="number" id="max-tokens" defaultValue="4000" />
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
                <Label>Theme</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start">
                    Light
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Dark
                  </Button>
                  <Button variant="outline" className="justify-start col-span-2">
                    System Default
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Density</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start">
                    Compact
                  </Button>
                  <Button variant="outline" className="justify-start">
                    Comfortable
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure external API connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <Input id="openai-key" type="password" defaultValue="sk-••••••••••••••••••••••••" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                <Input id="anthropic-key" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endpoint-url">Custom Endpoint URL</Label>
                <Input id="endpoint-url" defaultValue="https://api.example.com/v1" />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notif">Email Notifications</Label>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors">
                    <span className="absolute left-1 size-4 rounded-full bg-white transition-transform" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-notif">Browser Notifications</Label>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors">
                    <span className="absolute left-6 size-4 rounded-full bg-white transition-transform" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="approval-notif">Content Approval</Label>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors">
                    <span className="absolute left-6 size-4 rounded-full bg-white transition-transform" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 