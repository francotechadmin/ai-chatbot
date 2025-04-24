import { cookies } from 'next/headers';

import { NavSidebar } from '@/components/nav-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '../(auth)/auth';
import Script from 'next/script';
import { ProtectedRoute } from '@/components/protected-route';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  
  // Server-side logging for debugging
  console.log('Dashboard Layout - Session:', JSON.stringify(session, null, 2));
  console.log('Dashboard Layout - User:', session?.user);

  return (
    <ProtectedRoute>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        <NavSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
