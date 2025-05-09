'use client';

import { Button } from '@/components/ui/button';
import { FileIcon } from '@/components/icons';
import type { TimeRange } from '@/lib/services/metrics-aggregation';
import { useRouter } from 'next/navigation';
import { TimeRangeSelector } from './time-range-selector';

interface AnalyticsFiltersProps {
  initialTimeRange: TimeRange;
}

export function AnalyticsFilters({ initialTimeRange }: AnalyticsFiltersProps) {
  const router = useRouter();

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    // Navigate to the same page with the new time range as a query parameter
    router.push(`/analytics?timeRange=${newTimeRange}`);
  };

  return (
    <div className="flex gap-2">
      <TimeRangeSelector 
        timeRange={initialTimeRange} 
        onTimeRangeChange={handleTimeRangeChange} 
      />
      <Button variant="outline">
        <span className="mr-2"><FileIcon size={16} /></span>
        Export
      </Button>
    </div>
  );
}