'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ActivityDistribution as ActivityDistributionType } from '../types';
import { generateDonutSlice } from '../utils';

interface ActivityDistributionProps {
  data?: ActivityDistributionType | null;
}

export function ActivityDistribution({ data }: ActivityDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Distribution</CardTitle>
        <CardDescription>Type of system interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full flex items-center justify-center">
          {data ? (
            <div className="relative size-[180px]">
              {/* Queries slice */}
              <div 
                className="absolute inset-0 rounded-full border-8 border-blue-500" 
                style={{ 
                  clipPath: generateDonutSlice(0, data.queries.percentage) 
                }} 
              />
              {/* Captures slice */}
              <div 
                className="absolute inset-0 rounded-full border-8 border-green-500" 
                style={{ 
                  clipPath: generateDonutSlice(
                    data.queries.percentage,
                    data.queries.percentage + data.captures.percentage
                  ) 
                }} 
              />
              {/* Chat slice */}
              <div 
                className="absolute inset-0 rounded-full border-8 border-amber-500" 
                style={{ 
                  clipPath: generateDonutSlice(
                    data.queries.percentage + data.captures.percentage,
                    100
                  ) 
                }} 
              />
              {/* Inner circle */}
              <div className="absolute inset-0 rounded-full border-[24px] border-background" style={{ transform: 'scale(0.7)' }} />
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No activity distribution data available
            </div>
          )}
        </div>
        
        {data && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center gap-2">
              <div className="size-3 bg-blue-500 rounded-full" />
              <span className="text-sm">Queries ({data.queries.percentage}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 bg-green-500 rounded-full" />
              <span className="text-sm">Captures ({data.captures.percentage}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 bg-amber-500 rounded-full" />
              <span className="text-sm">Chat ({data.chat.percentage}%)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}