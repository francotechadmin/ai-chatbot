'use client';

import { TimeRange } from '@/lib/services/metrics-aggregation';

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
}

export function TimeRangeSelector({ timeRange, onTimeRangeChange }: TimeRangeSelectorProps) {
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onTimeRangeChange(e.target.value as TimeRange);
  };

  return (
    <select 
      className="h-10 rounded-md border border-input bg-background px-3 py-2"
      value={timeRange}
      onChange={handleTimeRangeChange}
    >
      <option value="7d">Last 7 Days</option>
      <option value="30d">Last 30 Days</option>
      <option value="90d">Last 90 Days</option>
      <option value="180d">Last 6 Months</option>
      <option value="365d">Last Year</option>
      <option value="all">All Time</option>
    </select>
  );
}