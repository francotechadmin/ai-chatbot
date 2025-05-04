'use client';

import { Button } from './ui/button';
import { MicrophoneIcon, StopIcon } from './icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';

interface VoiceRecordButtonProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  disabled?: boolean;
  className?: string;
}

export function VoiceRecordButton({
  onStartRecording,
  onStopRecording,
  isRecording,
  isProcessing,
  disabled = false,
  className,
}: VoiceRecordButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Prevent default behavior to avoid page reload
    e.preventDefault();
    
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
    // Ensure keyboard is dismissed on mobile
    document.activeElement instanceof HTMLElement && document.activeElement.blur();
  };

  const tooltipText = isRecording 
    ? 'Stop recording' 
    : isProcessing 
      ? 'Connecting...' 
      : 'Start voice recording';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            data-testid="voice-record-button"
            className={cn(
              "rounded-md p-[7px] h-fit transition-colors",
              isRecording && "bg-red-500 hover:bg-red-600 text-white",
              className
            )}
            onClick={handleClick}
            disabled={disabled || isProcessing}
            variant={isRecording ? "default" : "ghost"}
            aria-label={tooltipText}
          >
            {isRecording ? (
              <StopIcon size={14} />
            ) : (
              <MicrophoneIcon size={14} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}