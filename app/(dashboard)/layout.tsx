'use client';

import SidebarLayout, { SidebarItem } from "@/components/sidebar-layout";
import Script from 'next/script';
import { SidebarProvider } from '@/components/ui/sidebar';
import { 
  Settings, 
  BarChart4, 
  Globe, 
  FileText,
  Code,
  Upload,
  Terminal,
  MessageSquare,
  Network,
  Users
} from "lucide-react";

const navigationItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Globe,
    type: "item",
  },
  {
    type: 'label',
    name: 'Management',
  },
  {
    name: "Knowledge Capture",
    href: "/capture",
    icon: FileText,
    type: "item",
  },
  {
    name: "Knowledge Query",
    href: "/query",
    icon: Code,
    type: "item",
  },
  {
    name: "Knowledge Base",
    href: "/knowledge-base",
    icon: Globe,
    type: "item",
  },
  {
    type: 'label',
    name: 'Tools',
  },
  {
    name: "Import/Export",
    href: "/tools",
    icon: Upload,
    type: "item",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart4,
    type: "item",
  },
  {
    name: "Integrations",
    href: "/integrations",
    icon: Terminal,
    type: "item",
  },
  {
    type: 'label',
    name: 'Administration',
  },
  {
    name: "User Management",
    href: "/users",
    icon: Users,
    type: "item",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    type: "item",
  },
  {
    name: "Help & Docs",
    href: "/help",
    icon: MessageSquare,
    type: "item",
  },
];

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Removed authentication check to prevent redirect to sign-in

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      {/* Keep the original SidebarProvider for components that depend on it */}
      <SidebarProvider defaultOpen={true}>
        <SidebarLayout 
          items={navigationItems}
          basePath=""
          sidebarTop={
            <div className="flex items-center gap-2">
              <Network size={24} />
              <span className="font-semibold">Knowledge Hub</span>
            </div>
          }
        >
          {children}
        </SidebarLayout>
      </SidebarProvider>
    </>
  );
}
