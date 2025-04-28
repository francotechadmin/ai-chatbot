'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { hasRole } from '@/lib/rbac';

import { 
  HomeIcon,
  MessageIcon,
  FileIcon,
  GlobeIcon,
  CodeIcon,
  UserIcon,
  LineChartIcon,
  UploadIcon,
  TerminalIcon,
  NetworkIcon
} from '@/components/icons';
// import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function NavSidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { setOpenMobile } = useSidebar();
  const user = session?.user;
  console.log('NavSidebar session:', session);
  console.log('NavSidebar user:', user);

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="w-full flex flex-row justify-center items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="flex gap-1 text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                <NetworkIcon size={24} />
                Knowledge Hub
              </span>
            </Link>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Core Navigation */}
        <div className="space-y-1 mb-4">
          <h3 className="px-3 text-xs font-medium text-muted-foreground mb-2">Core</h3>
          <nav className="space-y-1">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setOpenMobile(false)}
            >
              <HomeIcon size={18} />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/capture" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setOpenMobile(false)}
            >
              <FileIcon size={18} />
              <span>Knowledge Capture</span>
            </Link>
            <Link 
              href="/query" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setOpenMobile(false)}
            >
              <CodeIcon size={18} />
              <span>Knowledge Query</span>
            </Link>
            <Link 
              href="/knowledge-base" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setOpenMobile(false)}
            >
              <GlobeIcon size={18} />
              <span>Knowledge Base</span>
            </Link>
            {/* <Link 
              href="/knowledge-graph" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setOpenMobile(false)}
            >
              <GlobeIcon size={18} />
              <span>Knowledge Graph</span>
            </Link> */}
          </nav>
        </div>
        
        {/* Tools Section */}
        <div className="space-y-1 mb-4">
          <h3 className="px-3 text-xs font-medium text-muted-foreground mb-2">Tools</h3>
          <nav className="space-y-1">
            <Link 
              href="/tools" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setOpenMobile(false)}
            >
              <UploadIcon size={18} />
              <span>Import/Export</span>
            </Link>
            <Link 
              href="/analytics" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setOpenMobile(false)}
            >
              <LineChartIcon size={18} />
              <span>Analytics</span>
            </Link>
            <Link 
              href="/integrations" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
              onClick={() => setOpenMobile(false)}
            >
              <TerminalIcon size={18} />
              <span>Integrations</span>
            </Link>
          </nav>
        </div>
        
        {/* Administration Section - Only visible to admins and superusers */}
        {user && (
          <div className="space-y-1 mb-4">
            <h3 className="px-3 text-xs font-medium text-muted-foreground mb-2">Administration</h3>
            <nav className="space-y-1">
              {/* User Management - Only visible to admins and superusers */}
              {user?.role && ['admin', 'superuser'].includes(user.role) && (
                <Link 
                  href="/users" 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setOpenMobile(false)}
                >
                  <UserIcon />
                  <span>User Management</span>
                </Link>
              )}
              
              {/* Knowledge Base Management - Only visible to admins and superusers */}
              {/* {user?.role && ['admin', 'superuser'].includes(user.role) && (
                <Link 
                  href="/knowledge-base/manage" 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setOpenMobile(false)}
                >
                  <GlobeIcon size={18} />
                  <span>KB Management</span>
                </Link>
              )} */}
              
              {/* System Settings - Only visible to superusers */}
              {/* {user?.role === 'superuser' && (
                <Link 
                  href="/settings/system" 
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setOpenMobile(false)}
                >
                  <GlobeIcon size={18} />
                  <span>System Settings</span>
                </Link>
              )}
               */}
              {/* User Settings - Visible to all users */}
              <Link 
                href="/settings" 
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                onClick={() => setOpenMobile(false)}
              >
                <GlobeIcon size={18} />
                <span>User Settings</span>
              </Link>
              
              <Link 
                href="/help" 
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                onClick={() => setOpenMobile(false)}
              >
                <MessageIcon size={18} />
                <span>Help & Docs</span>
              </Link>
            </nav>
          </div>
        )}
        
        {/* Recent Chats section removed - now available in modal/sheet */}
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}

// For backward compatibility
export { NavSidebar as AppSidebar };
