'use client';

// Available voices for text-to-speech
export const AVAILABLE_VOICES = [
  'alloy',
  'echo',
  'fable',
  'onyx',
  'nova',
  'shimmer'
];

// Default voice to use
export const DEFAULT_VOICE = 'alloy';

// Interface for TTS options
export interface TTSOptions {
  voice?: string;
  pitch?: number;
  rate?: number;
}

// Global audio manager to ensure only one audio plays at a time
class AudioManager {
  private static instance: AudioManager;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioId: string | null = null;
  private isPlaying = false;
  private playQueue: Array<{audio: HTMLAudioElement, id: string}> = [];

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public play(audio: HTMLAudioElement, id: string): void {
    // If already playing something, stop it first
    if (this.isPlaying) {
      this.stop();
    }
    
    // Set the new current audio
    this.currentAudio = audio;
    this.currentAudioId = id;
    this.isPlaying = true;
    
    // Set data attribute for identification
    audio.dataset.id = id;
    
    // Add an ended event listener to handle when audio finishes naturally
    const originalOnEnded = audio.onended;
    audio.onended = (e) => {
      console.log('AudioManager: Audio ended naturally');
      
      // Call the original onended handler if it exists
      if (originalOnEnded && typeof originalOnEnded === 'function') {
        originalOnEnded.call(audio, e);
      }
      
      // Reset the current audio and dispatch state change
      this.currentAudio = null;
      this.currentAudioId = null;
      this.isPlaying = false;
      this.dispatchStateChangeEvent(false);
      
      // Play the next item in the queue if any
      this.playNextInQueue();
    };
    
    // Dispatch event to notify components
    this.dispatchStateChangeEvent(true);
    
    // Play the audio
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
      this.currentAudio = null;
      this.currentAudioId = null;
      this.dispatchStateChangeEvent(false);
      
      // Try to play the next item in the queue
      this.playNextInQueue();
    });
  }
  
  private playNextInQueue(): void {
    if (this.playQueue.length > 0) {
      const next = this.playQueue.shift();
      if (next) {
        this.play(next.audio, next.id);
      }
    }
  }
  
  public queueAudio(audio: HTMLAudioElement, id: string): void {
    // If nothing is playing, play immediately
    if (!this.isPlaying) {
      this.play(audio, id);
    } else {
      // Otherwise add to queue
      this.playQueue.push({audio, id});
    }
  }

  public stop(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {
        console.error('Error stopping audio:', e);
      }
      
      // Dispatch event to notify components
      this.dispatchStateChangeEvent(false);
      
      this.currentAudio = null;
      this.currentAudioId = null;
      this.isPlaying = false;
      
      // Clear the queue when manually stopped
      this.playQueue = [];
    }
  }

  private dispatchStateChangeEvent(isPlaying: boolean): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('tts-state-change', {
        detail: {
          isPlaying,
          id: this.currentAudioId
        }
      });
      window.dispatchEvent(event);
    }
  }
}

/**
 * Speaks the given text using the Web Speech API
 * @param text The text to speak
 * @param options Options for the speech synthesis
 * @returns A promise that resolves when the speech is complete
 */
export function speakText(text: string, options: TTSOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech not supported in this browser');
      reject(new Error('Text-to-speech not supported'));
      return;
    }

    // Stop any currently playing speech
    stopSpeaking();

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on option or default
    const voiceName = options.voice || DEFAULT_VOICE;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find a matching voice
    const voice = voices.find(v => 
      v.name.toLowerCase().includes(voiceName.toLowerCase())
    );
    
    if (voice) {
      utterance.voice = voice;
    }
    
    // Set other options if provided
    if (options.pitch) utterance.pitch = options.pitch;
    if (options.rate) utterance.rate = options.rate;
    
    // Set up event handlers
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stops any ongoing speech
 */
export function stopSpeaking(): void {
  // Stop Web Speech API
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  
  // Stop any playing audio using the AudioManager
  if (typeof window !== 'undefined') {
    AudioManager.getInstance().stop();
  }
}

/**
 * Checks if the browser is currently speaking
 * @returns True if speaking, false otherwise
 */
export function isSpeaking(): boolean {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
}

/**
 * Fetches audio from OpenAI TTS API and plays it
 * @param text The text to convert to speech
 * @param voice The voice to use
 * @param audioId Optional unique identifier for this audio instance
 * @returns A promise that resolves with the audio URL
 */
export async function fetchAndPlayAudio(
  text: string,
  voice: string = DEFAULT_VOICE,
  audioId = `tts-${Date.now()}`
): Promise<string> {
  try {
    console.log(`Fetching TTS for text (${text.length} chars): "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    
    // Ensure text is not empty
    if (!text || text.trim().length === 0) {
      console.error('Empty text provided to fetchAndPlayAudio');
      return '';
    }
    
    // Call the TTS API
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        voice
      }),
    });
    
    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }
    
    // Get the audio blob
    const audioBlob = await response.blob();
    
    if (audioBlob.size === 0) {
      console.error('Received empty audio blob from TTS API');
      return '';
    }
    
    console.log(`Received audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
    
    // Create an object URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Create an audio element
    const audio = new Audio(audioUrl);
    
    // Preload the audio
    audio.preload = 'auto';
    
    // Set up event listeners
    audio.onloadedmetadata = () => {
      console.log(`Audio duration: ${audio.duration} seconds`);
    };
    
    audio.onended = () => {
      console.log('Audio ended naturally');
      // Clean up the object URL when done
      URL.revokeObjectURL(audioUrl);
      
      // Notify the AudioManager that playback has ended
      AudioManager.getInstance().stop();
    };
    
    audio.onerror = (e) => {
      console.error('Audio playback error:', e);
    };
    
    // Store the audio element in a global variable so it can be stopped
    (window as any).__currentTTSAudio = audio;
    
    // Use the AudioManager to queue the audio (it will play immediately if nothing else is playing)
    AudioManager.getInstance().queueAudio(audio, audioId);
    
    // Return the URL so it can be used elsewhere if needed
    return audioUrl;
  } catch (error) {
    console.error('Error fetching TTS audio:', error);
    // Fall back to browser TTS
    await speakText(text, { voice });
    return '';
  }
}