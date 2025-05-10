'use client';

import { useState } from 'react';

interface ImportSettingsProps {
  onChange?: (settings: ImportSettingsValues) => void;
  defaultSettings?: Partial<ImportSettingsValues>;
}

export interface ImportSettingsValues {
  autoCategorize: boolean;
  extractMetadata: boolean;
  removeDuplicates: boolean;
}

export function ImportSettings({ onChange, defaultSettings }: ImportSettingsProps) {
  const [settings, setSettings] = useState<ImportSettingsValues>({
    autoCategorize: defaultSettings?.autoCategorize ?? false,
    extractMetadata: defaultSettings?.extractMetadata ?? true,
    removeDuplicates: defaultSettings?.removeDuplicates ?? true,
  });

  const handleSettingChange = (setting: keyof ImportSettingsValues, value: boolean) => {
    const updatedSettings = { ...settings, [setting]: value };
    setSettings(updatedSettings);
    
    if (onChange) {
      onChange(updatedSettings);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Import Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs md:text-sm" htmlFor="auto-categorize">Auto-categorize content</label>
          <input 
            type="checkbox" 
            id="auto-categorize" 
            className="rounded border-input" 
            checked={settings.autoCategorize}
            onChange={(e) => handleSettingChange('autoCategorize', e.target.checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-xs md:text-sm" htmlFor="extract-metadata">Extract metadata</label>
          <input 
            type="checkbox" 
            id="extract-metadata" 
            className="rounded border-input" 
            checked={settings.extractMetadata}
            onChange={(e) => handleSettingChange('extractMetadata', e.target.checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-xs md:text-sm" htmlFor="dedup">Remove duplicates</label>
          <input 
            type="checkbox" 
            id="dedup" 
            className="rounded border-input" 
            checked={settings.removeDuplicates}
            onChange={(e) => handleSettingChange('removeDuplicates', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
}