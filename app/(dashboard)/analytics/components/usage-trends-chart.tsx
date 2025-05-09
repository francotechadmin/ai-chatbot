'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { UsageTrend } from '../types';
import { generateChartPath } from '../utils';

interface UsageTrendsChartProps {
  data?: UsageTrend[];
}

export function UsageTrendsChart({ data }: UsageTrendsChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Usage Trends</CardTitle>
        <CardDescription>System activity over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full bg-muted/20 rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-full h-48 px-8 relative">
              {/* Chart axes */}
              <div className="absolute bottom-0 left-0 w-full h-px bg-border" />
              <div className="absolute top-0 left-0 h-full w-px bg-border" />
              
              {/* Queries line */}
              {data && data.length > 0 && (
                <div className="absolute bottom-0 left-0 size-full overflow-hidden">
                  <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path 
                      d={generateChartPath(data, 'queries')}
                      fill="none" 
                      stroke="#2563eb" 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )}
              
              {/* Captures line */}
              {data && data.length > 0 && (
                <div className="absolute bottom-0 left-0 size-full overflow-hidden">
                  <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path 
                      d={generateChartPath(data, 'captures')}
                      fill="none" 
                      stroke="#16a34a" 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-blue-600 rounded-full" />
                <span className="text-sm">Queries</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 bg-green-600 rounded-full" />
                <span className="text-sm">Captures</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}