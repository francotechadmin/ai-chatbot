'use client';

import { useState, useRef } from 'react';
import { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { toast } from 'sonner';
import { AccountInfo } from './account-info';
import { ThemeSelector } from './theme-selector';
import { ChatDefaults } from './chat-defaults';
import { AuthSession } from './auth-session';
import { saveChatModelAsCookie } from '@/app/(dashboard)/query/actions';
import { saveDefaultVisibilityAsCookie } from '../actions';

interface SettingsFormProps {
  session: Session | null;
  initialModel: string;
  initialVisibility: 'private' | 'public';
}

export function SettingsForm({ 
  session, 
  initialModel, 
  initialVisibility 
}: SettingsFormProps) {
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [defaultVisibility, setDefaultVisibility] = useState<'private' | 'public'>(initialVisibility);

  const handleSettingsChange = (hasChanges: boolean) => {
    setHasChanges(hasChanges);
  };

  // This function will be called by the ChatDefaults component to update the parent state
  const updateSettings = (model: string, visibility: 'private' | 'public') => {
    setSelectedModel(model);
    setDefaultVisibility(visibility);
    
    const hasChanges = 
      model !== initialModel || 
      visibility !== initialVisibility;
    
    setHasChanges(hasChanges);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      // Get the current values from the form elements
      const modelSelect = document.getElementById('default-model') as HTMLSelectElement;
      const visibilitySelect = document.getElementById('default-visibility') as HTMLSelectElement;
      
      const modelValue = modelSelect?.value || selectedModel;
      const visibilityValue = (visibilitySelect?.value as 'private' | 'public') || defaultVisibility;
      
      // Save model selection to cookie
      await saveChatModelAsCookie(modelValue);
      
      // Save visibility preference to cookie
      await saveDefaultVisibilityAsCookie(visibilityValue);
            
      // Show success message
      toast.success('Settings saved successfully');
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6" id="settings-form-container">
      <div className="flex flex-col gap-6">
        <PageHeader title='Settings'>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
          >
            {saved ? 'Saved!' : isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Information */}
          <AccountInfo session={session} />

          {/* Appearance */}
          <ThemeSelector />

          {/* Chat Defaults */}
          <ChatDefaults 
            initialModel={initialModel}
            initialVisibility={initialVisibility}
            onSettingsChange={handleSettingsChange}
          />

          {/* Auth Session */}
          <AuthSession session={session} />
        </div>
      </div>
    </div>
  );
}