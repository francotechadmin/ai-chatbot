'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { chatModels, DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

interface ChatDefaultsProps {
  initialModel: string;
  initialVisibility: 'private' | 'public';
  onSettingsChange: (hasChanges: boolean) => void;
}

export function ChatDefaults({ 
  initialModel = DEFAULT_CHAT_MODEL, 
  initialVisibility = 'private',
  onSettingsChange
}: ChatDefaultsProps) {
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [defaultVisibility, setDefaultVisibility] = useState<'private' | 'public'>(initialVisibility);

  // Check for changes when values change
  useEffect(() => {
    const hasChanges = 
      selectedModel !== initialModel || 
      defaultVisibility !== initialVisibility;
    
    onSettingsChange(hasChanges);
  }, [selectedModel, defaultVisibility, initialModel, initialVisibility, onSettingsChange]);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const handleVisibilityChange = (visibility: 'private' | 'public') => {
    setDefaultVisibility(visibility);
  };

  return (
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
              onChange={(e) => handleModelChange(e.target.value)}
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
              onChange={(e) => handleVisibilityChange(e.target.value as 'private' | 'public')}
            >
              <option value="private">Private - Only you can access</option>
              <option value="public">Public - Anyone with the link can access</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}