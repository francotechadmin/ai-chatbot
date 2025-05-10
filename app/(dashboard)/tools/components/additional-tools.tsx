'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UploadIcon } from '@/components/icons';

export function AdditionalTools() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle>Batch Processing</CardTitle>
          <CardDescription>Process multiple files at once</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <p className="text-xs md:text-sm text-muted-foreground mb-4">
            Upload multiple documents for automated processing and knowledge extraction.
          </p>
          <div className="flex justify-center">
            <span><UploadIcon size={32} /></span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
          <Button size="sm" variant="outline" className="w-full text-xs md:text-sm">Start Batch Processing</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle>Integration Connectors</CardTitle>
          <CardDescription>Connect to external systems</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <p className="text-xs md:text-sm text-muted-foreground mb-4">
            Import knowledge directly from connected systems like Slack, Google Drive, or Microsoft 365.
          </p>
          <div className="grid grid-cols-4 gap-2">
            <div className="flex justify-center items-center aspect-square rounded bg-muted/40">
              <span className="text-xl">S</span>
            </div>
            <div className="flex justify-center items-center aspect-square rounded bg-muted/40">
              <span className="text-xl">G</span>
            </div>
            <div className="flex justify-center items-center aspect-square rounded bg-primary/10">
              <span className="text-xl text-primary">SP</span>
            </div>
            <div className="flex justify-center items-center aspect-square rounded bg-primary/10">
              <span className="text-xl text-primary">OD</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
          <Button size="sm" variant="outline" className="w-full text-xs md:text-sm">Configure Integrations</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle>Data Cleanup</CardTitle>
          <CardDescription>Maintain knowledge quality</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <p className="text-xs md:text-sm text-muted-foreground mb-4">
            Clean up outdated or redundant information, merge similar entries, and optimize your knowledge base.
          </p>
          <div className="flex justify-center items-center h-16">
            <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl text-blue-600">🧹</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
          <Button size="sm" variant="outline" className="w-full text-xs md:text-sm">Start Cleanup</Button>
        </CardFooter>
      </Card>
    </div>
  );
}