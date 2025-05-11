import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { SettingsForm } from './components/settings-form';

export default async function SettingsPage() {
  // Get user session on the server
  const session = await auth();
  
  return (
    <Suspense fallback={<div>Loading settings...</div>}>
      <SettingsForm 
        session={session}
        initialModel={DEFAULT_CHAT_MODEL}
        initialVisibility={'private'}
      />
    </Suspense>
  );
}
