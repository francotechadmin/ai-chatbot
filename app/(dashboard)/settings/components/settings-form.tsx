'use client';

import { useState } from 'react';
import type { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { toast } from 'sonner';
import { AccountInfo } from './account-info';
import { ThemeSelector } from './theme-selector';
import { AuthSession } from './auth-session';

interface SettingsFormProps {
  session: Session | null;
}

export function SettingsForm({ session }: SettingsFormProps) {
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
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
        <PageHeader title="Settings">
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {saved ? 'Saved!' : isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Information */}
          <AccountInfo session={session} />

          {/* Appearance */}
          <ThemeSelector />

          {/* Auth Session */}
          <AuthSession session={session} />
        </div>
      </div>
    </div>
  );
}
