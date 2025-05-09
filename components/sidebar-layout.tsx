"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, Menu, User } from "lucide-react";
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
        "flex-grow justify-start text-md text-zinc-800 dark:text-zinc-300 px-2"
      )}
      onClick={props.onClick}
      prefetch={true}
    >
      <props.item.icon className="mr-2 h-5 w-5" />
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
      <div className="h-14 flex items-center px-2 shrink-0 mr-10 md:mr-0 border-b">
        {props.sidebarTop}
      </div>
      <div className="flex flex-grow flex-col gap-2 pt-4 overflow-y-auto">
        {props.items.map((item, index) => {
          if (item.type === "separator") {
            return <Separator key={index} className="my-2" />;
          } else if (item.type === "item") {
            return (
              <div key={index} className="flex px-2">
                <NavItem
                  item={item}
                  onClick={props.onNavigate}
                  basePath={props.basePath}
                />
              </div>
            );
          } else {
            return (
              <div key={index} className="flex my-2">
                <div className="flex-grow justify-start text-sm font-medium text-zinc-500 px-2">
                  {item.name}
                </div>
              </div>
            );
          }
        })}

        <div className="flex-grow" />
      </div>
    </div>
  );
}

export type HeaderBreadcrumbItem = { title: string; href: string };

function HeaderBreadcrumb(props: { items: SidebarItem[], baseBreadcrumb?: HeaderBreadcrumbItem[], basePath: string }) {
  const segment = useSegment(props.basePath);
  const item = props.items.find((item) => item.type === 'item' && item.href === segment);
  const title: string | undefined = (item as any)?.name

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {props.baseBreadcrumb?.map((item, index) => (
          <React.Fragment key={`breadcrumb-${index}`}>
            <BreadcrumbItem>
              <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Simple UserButton component to replace the one from @stackframe/stack
function UserButton({ colorModeToggle }: { colorModeToggle: () => void }) {
  return (
    <button 
      onClick={colorModeToggle}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground"
    >
      <span className="sr-only">Toggle theme</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="M4.93 4.93l1.41 1.41"></path>
        <path d="M17.66 17.66l1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="M6.34 17.66l-1.41 1.41"></path>
        <path d="M19.07 4.93l-1.41 1.41"></path>
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
      <div className="flex flex-col flex-grow w-0">
        <div className="h-14 border-b flex items-center justify-between sticky top-0 bg-white dark:bg-black z-10 px-4 md:px-6">
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
        <div className="flex-grow">{props.children}</div>
      </div>
    </div>
  );
}