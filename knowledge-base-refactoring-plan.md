# Knowledge Base Refactoring Implementation Plan

This document outlines the detailed implementation steps to refactor the knowledge base section using React Server Components with the Client Islands pattern.

## 1. Server Actions

Create a server actions file to replace API routes:

```typescript
// app/(dashboard)/knowledge-base/actions.ts
"use server";

import { auth } from "@/app/(auth)/auth";
import {
  getKnowledgeSourcesByStatus,
  getKnowledgeSourceById,
  getKnowledgeChunksBySourceId,
  updateKnowledgeSourceStatus,
  deleteKnowledgeSource,
} from "@/lib/db/queries";

export async function fetchKnowledgeSources() {
  // Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Fetch all statuses and combine
  const pendingSources = await getKnowledgeSourcesByStatus("pending");
  const approvedSources = await getKnowledgeSourcesByStatus("approved");
  const rejectedSources = await getKnowledgeSourcesByStatus("rejected");

  return [...pendingSources, ...approvedSources, ...rejectedSources];
}

export async function fetchKnowledgeSourceById(id: string) {
  // Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const source = await getKnowledgeSourceById(id);
  if (!source) {
    throw new Error("Knowledge source not found");
  }

  const chunks = await getKnowledgeChunksBySourceId(id);

  return { source, chunks };
}

export async function updateSourceStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
) {
  // Authentication and authorization check
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "admin" && session.user.role !== "superuser") {
    throw new Error("Unauthorized");
  }

  await updateKnowledgeSourceStatus({
    id,
    status,
    approvedBy: status === "approved" ? session.user.id : undefined,
  });

  return getKnowledgeSourceById(id);
}

export async function deleteSource(id: string) {
  // Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const source = await getKnowledgeSourceById(id);
  if (!source) {
    throw new Error("Knowledge source not found");
  }

  // Check if user is the owner or an admin
  if (
    source.userId !== session.user.id &&
    session.user.role !== "admin" &&
    session.user.role !== "superuser"
  ) {
    throw new Error("Unauthorized");
  }

  await deleteKnowledgeSource(id);
  return { success: true };
}
```

## 2. Client Components for Interactive Parts

### Search and Filter Component

```typescript
// app/(dashboard)/knowledge-base/components/search-filter.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface SearchFilterProps {
  initialQuery: string;
}

export function SearchFilter({ initialQuery }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Update URL with search query
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          placeholder="Search knowledge base..."
          className="pl-10"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <Button variant="outline" size="icon">
        <Filter size={18} />
      </Button>
    </div>
  );
}
```

### Status Tabs Component

```typescript
// app/(dashboard)/knowledge-base/components/status-tabs.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnowledgeSource } from "@/lib/db/schema";
import { KnowledgeSourceGrid } from "./knowledge-source-grid";

interface StatusTabsProps {
  sources: KnowledgeSource[];
  filteredSources: KnowledgeSource[];
}

export function StatusTabs({ sources, filteredSources }: StatusTabsProps) {
  const [activeTab, setActiveTab] = useState("all");

  // Get counts for each status
  const pendingCount = sources.filter(
    (source) => source.status === "pending"
  ).length;
  const approvedCount = sources.filter(
    (source) => source.status === "approved"
  ).length;
  const rejectedCount = sources.filter(
    (source) => source.status === "rejected"
  ).length;

  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="all">All ({sources.length})</TabsTrigger>
        <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
        <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
        <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-0">
        <KnowledgeSourceGrid sources={filteredSources} />
      </TabsContent>

      <TabsContent value="pending" className="mt-0">
        <KnowledgeSourceGrid
          sources={filteredSources.filter(
            (source) => source.status === "pending"
          )}
        />
      </TabsContent>

      <TabsContent value="approved" className="mt-0">
        <KnowledgeSourceGrid
          sources={filteredSources.filter(
            (source) => source.status === "approved"
          )}
        />
      </TabsContent>

      <TabsContent value="rejected" className="mt-0">
        <KnowledgeSourceGrid
          sources={filteredSources.filter(
            (source) => source.status === "rejected"
          )}
        />
      </TabsContent>
    </Tabs>
  );
}
```

### Knowledge Source Grid Component

```typescript
// app/(dashboard)/knowledge-base/components/knowledge-source-grid.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  FileImage,
  Video,
  Globe,
  Database,
  MessageSquare,
} from "lucide-react";
import { formatDistance } from "date-fns";
import type { KnowledgeSource } from "@/lib/db/schema";

interface KnowledgeSourceGridProps {
  sources: KnowledgeSource[];
}

export function KnowledgeSourceGrid({ sources }: KnowledgeSourceGridProps) {
  const router = useRouter();

  if (sources.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto size-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">
          No knowledge sources found
        </h3>
        <p className="text-muted-foreground mt-2">
          Start by capturing knowledge or uploading documents.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sources.map((source) => (
        <Card
          key={source.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/knowledge-base/${source.id}`)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{source.title}</CardTitle>
              {source.status === "pending" && (
                <Clock size={18} className="text-yellow-500" />
              )}
              {source.status === "approved" && (
                <CheckCircle size={18} className="text-green-500" />
              )}
              {source.status === "rejected" && (
                <XCircle size={18} className="text-red-500" />
              )}
            </div>
            <CardDescription className="flex items-center gap-1">
              {source.sourceType === "document" && (
                <FileText size={14} className="text-blue-500" />
              )}
              {source.sourceType === "image" && (
                <FileImage size={14} className="text-green-500" />
              )}
              {source.sourceType === "video" && (
                <Video size={14} className="text-red-500" />
              )}
              {source.sourceType === "webpage" && (
                <Globe size={14} className="text-purple-500" />
              )}
              {source.sourceType === "api" && (
                <Database size={14} className="text-orange-500" />
              )}
              {source.sourceType === "chat" && (
                <MessageSquare size={14} className="text-teal-500" />
              )}
              <span>
                {source.sourceType.charAt(0).toUpperCase() +
                  source.sourceType.slice(1)}
              </span>
              {source.status === "pending" && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">
                  Pending
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm line-clamp-2">
              {source.description || "No description provided"}
            </p>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Added{" "}
            {formatDistance(new Date(source.createdAt), new Date(), {
              addSuffix: true,
            })}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

## 3. Client Components for Detail Page

```typescript
// app/(dashboard)/knowledge-base/[id]/components/source-actions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Trash, MessageSquare } from "lucide-react";
import { updateSourceStatus, deleteSource } from "../../actions";
import { KnowledgeSource } from "@/lib/db/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SourceActionsProps {
  source: KnowledgeSource;
}

export function SourceActions({ source }: SourceActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      await updateSourceStatus(source.id, "approved");
      toast.success("Knowledge source approved");
      router.refresh(); // Refresh the page to show updated status
    } catch (error) {
      console.error("Error approving knowledge source:", error);
      toast.error("Failed to approve knowledge source");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      await updateSourceStatus(source.id, "rejected");
      toast.success("Knowledge source rejected");
      router.refresh(); // Refresh the page to show updated status
    } catch (error) {
      console.error("Error rejecting knowledge source:", error);
      toast.error("Failed to reject knowledge source");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteSource(source.id);
      toast.success("Knowledge source deleted successfully");
      router.push("/knowledge-base");
    } catch (error) {
      console.error("Error deleting knowledge source:", error);
      toast.error("Failed to delete knowledge source");
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {source.status === "pending" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApprove}
              disabled={isLoading}
            >
              <CheckCircle size={16} className="mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={isLoading}
            >
              <XCircle size={16} className="mr-2" />
              Reject
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/query/new?sourceId=${source.id}`)}
        >
          <MessageSquare size={16} className="mr-2" />
          Query
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isLoading}
        >
          <Trash size={16} className="mr-2" />
          Delete
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              knowledge source and all associated chunks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

## 4. Refactor Main Page to Server Component

```typescript
// app/(dashboard)/knowledge-base/page.tsx
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { fetchKnowledgeSources } from "./actions";
import { SearchFilter } from "./components/search-filter";
import { StatusTabs } from "./components/status-tabs";

export default async function KnowledgeBasePage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user is admin
  if (session.user.role !== "admin" && session.user.role !== "superuser") {
    redirect("/dashboard");
  }

  // Get search query from URL params
  const searchQuery = searchParams?.search || "";

  // Fetch knowledge sources
  let sources;
  try {
    sources = await fetchKnowledgeSources();
  } catch (error) {
    console.error("Error fetching knowledge sources:", error);
    sources = [];
  }

  // Filter sources based on search query
  const filteredSources = sources.filter((source) => {
    return (
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="container mx-auto p-6">
      <PageHeader title="Knowledge Base">
        <Button asChild>
          <a href="/capture/new">
            <Plus size={16} className="mr-2" />
            New Capture
          </a>
        </Button>
      </PageHeader>

      <div className="mb-6">
        <SearchFilter initialQuery={searchQuery} />
        <StatusTabs sources={sources} filteredSources={filteredSources} />
      </div>
    </div>
  );
}
```

## 5. Refactor Detail Page to Server Component

```typescript
// app/(dashboard)/knowledge-base/[id]/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDistance } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { fetchKnowledgeSourceById } from "../actions";
import { SourceActions } from "./components/source-actions";

export default async function KnowledgeSourceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user is admin
  if (session.user.role !== "admin" && session.user.role !== "superuser") {
    redirect("/dashboard");
  }

  // Fetch knowledge source and chunks
  let source;
  let chunks;
  try {
    const data = await fetchKnowledgeSourceById(params.id);
    source = data.source;
    chunks = data.chunks;
  } catch (error) {
    console.error("Error fetching knowledge source:", error);
    redirect("/knowledge-base");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <a href="/knowledge-base">
            <ArrowLeft size={16} className="mr-2" />
            Back to Knowledge Base
          </a>
        </Button>

        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="text-2xl font-bold">{source.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {source.sourceType.charAt(0).toUpperCase() +
                  source.sourceType.slice(1)}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                Added{" "}
                {formatDistance(new Date(source.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <div className="flex items-center">
                {source.status === "pending" && (
                  <div className="flex items-center text-yellow-500">
                    <Clock size={16} className="mr-1" />
                    <span className="text-sm">Pending</span>
                  </div>
                )}
                {source.status === "approved" && (
                  <div className="flex items-center text-green-500">
                    <CheckCircle size={16} className="mr-1" />
                    <span className="text-sm">Approved</span>
                  </div>
                )}
                {source.status === "rejected" && (
                  <div className="flex items-center text-red-500">
                    <XCircle size={16} className="mr-1" />
                    <span className="text-sm">Rejected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <SourceActions source={source} />
        </div>

        {source.description && (
          <div className="mt-4 text-muted-foreground">{source.description}</div>
        )}
      </div>

      <Tabs defaultValue="chunks">
        <TabsList>
          <TabsTrigger value="chunks">Chunks ({chunks.length})</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="chunks" className="mt-4">
          {chunks.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">No chunks found</h3>
              <p className="text-muted-foreground mt-2">
                This knowledge source does not have any chunks.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {chunks.map((chunk) => (
                <Card key={chunk.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Chunk{" "}
                      {chunk.metadata &&
                      typeof chunk.metadata === "object" &&
                      "chunkIndex" in chunk.metadata
                        ? (chunk.metadata as any).chunkIndex + 1
                        : ""}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{chunk.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="metadata" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto">
                {JSON.stringify(source.metadata || {}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Implementation Steps

1. Create the directory structure:

   ```
   app/(dashboard)/knowledge-base/
   ├── actions.ts
   ├── page.tsx
   ├── components/
   │   ├── search-filter.tsx
   │   ├── status-tabs.tsx
   │   └── knowledge-source-grid.tsx
   └── [id]/
       ├── page.tsx
       └── components/
           └── source-actions.tsx
   ```

2. Implement the files in the order:

   - actions.ts
   - components (client islands)
   - page.tsx (main server component)
   - [id]/page.tsx (detail server component)

3. Remove the API routes:
   - app/api/knowledge-base/route.ts
   - app/api/knowledge-base/[id]/route.ts
   - app/api/knowledge-base/[id]/status/route.ts

## Next Steps

After implementing these changes, we should:

1. Test the functionality to ensure everything works as expected
2. Verify that the client islands are properly hydrated
3. Check that server-side data fetching is working correctly
4. Ensure error handling is robust
5. Optimize performance if needed
