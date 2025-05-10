'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface KnowledgeStatsProps {
  stats: {
    totalSources: number;
    totalChunks: number;
    pendingApproval: number;
    lastUpdated: string;
  };
}

export function KnowledgeStats({ stats }: KnowledgeStatsProps) {
  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <CardTitle>Knowledge Base Statistics</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Metric</th>
                <th className="text-left py-3 px-4 font-medium">Value</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4">
                  <div className="font-medium">Total Sources</div>
                  <div className="text-xs text-muted-foreground">Documents, websites, etc.</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{stats.totalSources}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1 inline-block">
                    Active
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">
                  <div className="font-medium">Knowledge Chunks</div>
                  <div className="text-xs text-muted-foreground">Individual pieces of information</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{stats.totalChunks}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1 inline-block">
                    Indexed
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">
                  <div className="font-medium">Pending Approval</div>
                  <div className="text-xs text-muted-foreground">Awaiting review</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{stats.pendingApproval}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 inline-block">
                    Pending
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-4">
          <div className="border rounded-md p-3">
            <div className="font-medium">Total Sources</div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-2xl font-bold">{stats.totalSources}</div>
              <div className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                Active
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Documents, websites, etc.</div>
          </div>
          
          <div className="border rounded-md p-3">
            <div className="font-medium">Knowledge Chunks</div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-2xl font-bold">{stats.totalChunks}</div>
              <div className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
                Indexed
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Individual pieces of information</div>
          </div>
          
          <div className="border rounded-md p-3">
            <div className="font-medium">Pending Approval</div>
            <div className="flex justify-between items-center mt-1">
              <div className="text-2xl font-bold">{stats.pendingApproval}</div>
              <div className="text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-1">
                Pending
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Awaiting review</div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4 text-right">
          Last updated: {stats.lastUpdated}
        </div>
      </CardContent>
    </Card>
  );
}