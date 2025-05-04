'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Volume2, Square } from 'lucide-react';
import { fetchAndPlayAudio, stopSpeaking } from '@/lib/text-to-speech';

interface TextToSpeechButtonProps {
  text: string;
  voice?: string;
}

export function TextToSpeechButton({ text, voice = 'alloy' }: TextToSpeechButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioId = useRef<string>(`tts-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  // Listen for global audio state changes
  useEffect(() => {
    const handleAudioStateChange = (event: CustomEvent) => {
      if (event.detail && typeof event.detail === 'object') {
        console.log('Audio state change event:', event.detail);
        
        // If this is our audio and it's playing, set speaking to true
        if (event.detail.isPlaying && event.detail.id === audioId.current) {
          console.log('Our audio is playing, setting isSpeaking to true');
          setIsSpeaking(true);
        }
        // If this is our audio and it's not playing, set speaking to false
        else if (!event.detail.isPlaying && event.detail.id === audioId.current) {
          console.log('Our audio stopped playing, setting isSpeaking to false');
          setIsSpeaking(false);
        }
        // If another audio is playing, set speaking to false
        else if (event.detail.isPlaying && event.detail.id !== audioId.current) {
          console.log('Another audio is playing, setting isSpeaking to false');
          setIsSpeaking(false);
        }
      }
    };

    // Add event listener for audio state changes
    window.addEventListener('tts-state-change' as any, handleAudioStateChange);

    return () => {
      window.removeEventListener('tts-state-change' as any, handleAudioStateChange);
    };
  }, []);
  
  // Add a listener for the audio element's ended event
  useEffect(() => {
    const checkAudioStatus = () => {
      const currentAudio = (window as any).__currentTTSAudio;
      if (currentAudio) {
        const originalOnEnded = currentAudio.onended;
        
        currentAudio.onended = (e: Event) => {
          console.log('Audio ended event triggered');
          setIsSpeaking(false);
          
          // Call the original onended handler if it exists
          if (originalOnEnded && typeof originalOnEnded === 'function') {
            originalOnEnded.call(currentAudio, e);
          }
        };
      }
    };
    
    // If we're speaking, set up the ended event handler
    if (isSpeaking) {
      checkAudioStatus();
    }
  }, [isSpeaking]);

  const handleClick = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    try {
      // Fetch the audio URL and play it
      await fetchAndPlayAudio(text, voice, audioId.current);
      
      // The state will be updated by the event listener
    } catch (error) {
      console.error('Error playing text-to-speech:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="py-1 px-2 h-fit text-muted-foreground"
          variant="outline"          onClick={handleClick}
          aria-label={isSpeaking ? "Stop speaking" : "Listen to this message"}
          data-speaking={isSpeaking ? "true" : "false"}
        >
          {isSpeaking ? <Square size={14} /> : <Volume2 size={14} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isSpeaking ? "Stop speaking" : "Listen to this message"}
      </TooltipContent>
    </Tooltip>
  );
}