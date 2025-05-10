'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileIcon, DownloadIcon } from '@/components/icons';

interface ExportOptionsProps {
  onExport?: (options: ExportOptionsValues) => void;
}

export interface ExportOptionsValues {
  format: 'json' | 'csv' | 'pdf' | 'markdown';
  contentSelection: 'all' | 'categories' | 'dateRange';
  includeMetadata: boolean;
  includeUsageStats: boolean;
}

export function ExportOptions({ onExport }: ExportOptionsProps) {
  const [options, setOptions] = useState<ExportOptionsValues>({
    format: 'json',
    contentSelection: 'all',
    includeMetadata: true,
    includeUsageStats: false,
  });

  const handleFormatChange = (format: ExportOptionsValues['format']) => {
    setOptions(prev => ({ ...prev, format }));
  };

  const handleContentSelectionChange = (contentSelection: ExportOptionsValues['contentSelection']) => {
    setOptions(prev => ({ ...prev, contentSelection }));
  };

  const handleSettingChange = (setting: 'includeMetadata' | 'includeUsageStats', value: boolean) => {
    setOptions(prev => ({ ...prev, [setting]: value }));
  };

  const handleExport = () => {
    if (onExport) {
      onExport(options);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Export Format</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            variant={options.format === 'json' ? 'default' : 'outline'} 
            className="justify-start text-xs md:text-sm py-1 h-auto md:h-10"
            onClick={() => handleFormatChange('json')}
          >
            <span className="mr-2"><FileIcon size={16} /></span>
            JSON
          </Button>
          <Button 
            size="sm" 
            variant={options.format === 'csv' ? 'default' : 'outline'} 
            className="justify-start text-xs md:text-sm py-1 h-auto md:h-10"
            onClick={() => handleFormatChange('csv')}
          >
            <span className="mr-2"><FileIcon size={16} /></span>
            CSV
          </Button>
          <Button 
            size="sm" 
            variant={options.format === 'pdf' ? 'default' : 'outline'} 
            className="justify-start text-xs md:text-sm py-1 h-auto md:h-10"
            onClick={() => handleFormatChange('pdf')}
          >
            <span className="mr-2"><FileIcon size={16} /></span>
            PDF
          </Button>
          <Button 
            size="sm" 
            variant={options.format === 'markdown' ? 'default' : 'outline'} 
            className="justify-start text-xs md:text-sm py-1 h-auto md:h-10"
            onClick={() => handleFormatChange('markdown')}
          >
            <span className="mr-2"><FileIcon size={16} /></span>
            Markdown
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Content Selection</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="radio" 
              id="all-content" 
              name="content-selection" 
              className="mr-2" 
              checked={options.contentSelection === 'all'}
              onChange={() => handleContentSelectionChange('all')}
            />
            <label className="text-xs md:text-sm" htmlFor="all-content">All knowledge content</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="selected-categories" 
              name="content-selection" 
              className="mr-2" 
              checked={options.contentSelection === 'categories'}
              onChange={() => handleContentSelectionChange('categories')}
            />
            <label className="text-xs md:text-sm" htmlFor="selected-categories">Selected categories</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="date-range" 
              name="content-selection" 
              className="mr-2" 
              checked={options.contentSelection === 'dateRange'}
              onChange={() => handleContentSelectionChange('dateRange')}
            />
            <label className="text-xs md:text-sm" htmlFor="date-range">Date range</label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Export Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs md:text-sm" htmlFor="include-metadata">Include metadata</label>
            <input 
              type="checkbox" 
              id="include-metadata" 
              className="rounded border-input" 
              checked={options.includeMetadata}
              onChange={(e) => handleSettingChange('includeMetadata', e.target.checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs md:text-sm" htmlFor="include-usage-stats">Include usage statistics</label>
            <input 
              type="checkbox" 
              id="include-usage-stats" 
              className="rounded border-input" 
              checked={options.includeUsageStats}
              onChange={(e) => handleSettingChange('includeUsageStats', e.target.checked)}
            />
          </div>
        </div>
      </div>

      <Button size="sm" className="w-full text-xs md:text-sm" onClick={handleExport}>
        <span className="mr-2"><DownloadIcon size={16} /></span>
        Export Knowledge Base
      </Button>
    </div>
  );
}