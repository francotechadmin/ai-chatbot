"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon, Menu, } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { buttonVariants } from "./ui/button";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

function useSegment(basePath: string) {
  const path = usePathname();
  const result = path.slice(basePath.length, path.length);
  return result ? result : "/";
}

type Item = {
  name: React.ReactNode;
  href: string;
  icon: LucideIcon;
  type: "item";
};

type Sep = {
  type: "separator";
};

type Label = {
  name: React.ReactNode;
  type: "label";
};

export type SidebarItem = Item | Sep | Label;

function NavItem(props: {
  item: Item;
  onClick?: () => void;
  basePath: string;
}) {
  const segment = useSegment(props.basePath);
  const selected = segment === props.item.href;

  return (
    <Link
      href={props.basePath + props.item.href}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        selected && "bg-muted",
        "grow justify-start text-md text-zinc-800 dark:text-zinc-300 px-2"
      )}
      onClick={props.onClick}
      prefetch={true}
    >
      <props.item.icon className="mr-2 size-5" />
      {props.item.name}
    </Link>
  );
}

function SidebarContent(props: {
  onNavigate?: () => void;
  items: SidebarItem[];
  sidebarTop?: React.ReactNode;
  basePath: string;
}) {
  const path = usePathname();
  const segment = useSegment(props.basePath);

  return (
    <div className="flex flex-col h-full items-stretch">
      <div className="h-14 flex items-center px-4 shrink-0 mr-10 md:mr-0 border-b">
        {props.sidebarTop}
      </div>
      <div className="flex grow flex-col gap-2 pt-4 overflow-y-auto">
        {props.items.map((item, index) => {
          if (item.type === "separator") {
            // Generate a stable key for separators based on their position in the array
            // and surrounding items to make it more unique
            const prevItem = index > 0 ? props.items[index - 1] : null;
            const nextItem = index < props.items.length - 1 ? props.items[index + 1] : null;
            const prevName = prevItem && 'name' in prevItem ? String(prevItem.name) : 'start';
            const nextName = nextItem && 'name' in nextItem ? String(nextItem.name) : 'end';
            return <Separator key={`separator-between-${prevName}-and-${nextName}`} className="my-2" />;
          } else if (item.type === "item") {
            return (
              <div key={`item-${item.href || item.name}-${index}`} className="flex px-2">
                <NavItem
                  item={item}
                  onClick={props.onNavigate}
                  basePath={props.basePath}
                />
              </div>
            );
          } else {
            return (
              <div key={`header-${item.name}-${index}`} className="flex my-2">
                <div className="grow justify-start text-sm font-medium text-zinc-500 px-2">
                  {item.name}
                </div>
              </div>
            );
          }
        })}

        <div className="grow min-height-0" />
      </div>
    </div>
  );
}

export type HeaderBreadcrumbItem = { title: string; href: string };

function HeaderBreadcrumb(props: { items: SidebarItem[], baseBreadcrumb?: HeaderBreadcrumbItem[], basePath: string }) {
  const pathname = usePathname();
  const relativePath = pathname.startsWith(props.basePath) 
    ? pathname.slice(props.basePath.length) 
    : pathname;
  
  // Split the path into segments
  const pathSegments = relativePath.split('/').filter(Boolean);
  
  // Find the first level navigation item
  const firstSegment = pathSegments[0] ? `/${pathSegments[0]}` : '/';
  const navItem = props.items.find(
    (item) => item.type === 'item' && item.href === firstSegment
  ) as Item | undefined;
  
  // Build breadcrumb items
  const breadcrumbItems: HeaderBreadcrumbItem[] = [];
  
  // Add base breadcrumb items
  if (props.baseBreadcrumb && props.baseBreadcrumb.length > 0) {
    breadcrumbItems.push(...props.baseBreadcrumb);
  }
  
  // Add the first level navigation item if found
  if (navItem) {
    breadcrumbItems.push({
      title: navItem.name as string,
      href: `${props.basePath}${navItem.href}`
    });
    
    // Add additional path segments as breadcrumb items
    if (pathSegments.length > 1) {
      for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const href = `${props.basePath}/${pathSegments.slice(0, i + 1).join('/')}`;
        
        // Capitalize the first letter of the segment for display
        let title = segment.charAt(0).toUpperCase() + segment.slice(1);

        //truncate the title if it's too long
        const maxLength = 10;

        if (title.length > maxLength) {
          title = title.slice(0, maxLength) + '...';
        }
        
        breadcrumbItems.push({
          title,
          href
        });
      }
    }
  }

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={`breadcrumb-${item.href || item.title}-${index}`}>
            {index < breadcrumbItems.length - 1 ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Simple UserButton component to replace the one from @stackframe/stack
function UserButton({ colorModeToggle }: { colorModeToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={colorModeToggle}
      className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground"
    >
      <span className="sr-only">Toggle theme</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M6.34 17.66l-1.41 1.41" />
        <path d="M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}

export default function SidebarLayout(props: {
  children?: React.ReactNode;
  baseBreadcrumb?: HeaderBreadcrumbItem[];
  items: SidebarItem[];
  sidebarTop?: React.ReactNode;
  basePath: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="w-full flex">
      <div className="flex-col border-r w-[240px] h-screen sticky top-0 hidden md:flex">
        <SidebarContent items={props.items} sidebarTop={props.sidebarTop} basePath={props.basePath} />
      </div>
      <div className="flex flex-col grow w-0 h-screen">
        <div className="h-14 border-b flex items-center justify-between sticky top-0 bg-white dark:bg-black z-10 px-4 md:px-6 shrink-0">
          <div className="hidden md:flex">
            <HeaderBreadcrumb baseBreadcrumb={props.baseBreadcrumb} basePath={props.basePath} items={props.items} />
          </div>

          <div className="flex md:hidden items-center">
            <Sheet
              onOpenChange={(open) => setSidebarOpen(open)}
              open={sidebarOpen}
            >
              <SheetTrigger>
                <Menu />
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-0">
                <SidebarContent
                  onNavigate={() => setSidebarOpen(false)}
                  items={props.items}
                  sidebarTop={props.sidebarTop}
                  basePath={props.basePath}
                />
              </SheetContent>
            </Sheet>

            <div className="ml-4 flex md:hidden">
              <HeaderBreadcrumb baseBreadcrumb={props.baseBreadcrumb} basePath={props.basePath} items={props.items} />
            </div>
          </div>

          <UserButton
            colorModeToggle={() =>
              setTheme(resolvedTheme === "light" ? "dark" : "light")
            }
          />
        </div>
        <div className="grow min-height-0 overflow-auto">{props.children}</div>
      </div>
    </div>
  );
}