'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';

interface UseVoiceCaptureProps {
  chatId: string;
  onTranscription?: (text: string) => void;
  onAIResponse?: (text: string) => void;
}

interface VoiceSessionState {
  isConnected: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  isAISpeaking: boolean; // New state to track when AI is speaking
  voice: string;
}

export function useVoiceCapture({
  chatId,
  onTranscription,
  onAIResponse,
}: UseVoiceCaptureProps) {
  const [state, setState] = useState<VoiceSessionState>({
    isConnected: false,
    isRecording: false,
    isProcessing: false,
    isAISpeaking: false,
    voice: 'alloy',
  });
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionIdRef = useRef<string>(generateUUID());

  // Initialize WebRTC connection and start recording
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }));
      
      // Get microphone access first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Get ephemeral token from our server
      const tokenResponse = await fetch("/api/voice/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          voice: state.voice,
          sessionId: sessionIdRef.current
        }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error("Failed to get voice session token");
      }
      
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      // Create peer connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Set up audio element for playback
      const audioEl = new Audio();
      audioEl.autoplay = true;
      audioElRef.current = audioEl;
      
      // Handle incoming audio tracks
      pc.ontrack = e => {
        if (audioElRef.current) {
          audioElRef.current.srcObject = e.streams[0];
        }
      };
      
      // Add audio track to peer connection BEFORE creating offer
      stream.getAudioTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Set up data channel for events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      
      dc.addEventListener("open", () => {
        console.log("Data channel opened");
      });
      
      dc.addEventListener("message", (e) => {
        handleRealtimeEvent(e);
      });

      // Create and set local description (offer) AFTER adding audio tracks
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Connect to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime"; // Use the base model name without preview version
      // Remove intent=transcription to enable full conversation mode
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime=v1" // Required beta header
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error("Realtime API error response:", errorText);
        throw new Error(`Failed to connect to Realtime API: ${sdpResponse.status} ${sdpResponse.statusText}`);
      }

      // Set remote description (answer)
      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer as RTCSessionDescriptionInit);
      
      // Create a response to get transcription
      setTimeout(() => {
        if (dc.readyState === 'open') {
          console.log("Creating response to get transcription");
          const createResponseEvent = {
            type: "response.create",
            response: {
              modalities: ["text"]
            }
          };
          dc.send(JSON.stringify(createResponseEvent));
        }
      }, 1000);
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        isProcessing: false,
        isRecording: true
      }));
    } catch (error) {
      console.error("Failed to initialize voice connection:", error);
      toast.error("Failed to connect voice service");
      setState(prev => ({ ...prev, isProcessing: false }));
      
      // Clean up any resources if there was an error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    }
  }, [chatId, state.voice]);

  // Handle events from the Realtime API
  const handleRealtimeEvent = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received event:", data.type, data);
      
      // Handle different event types
      switch (data.type) {
        case "session.created":
          console.log("Voice session created:", data);
          
          // After session is created, create a response to get transcription
          if (dcRef.current && dcRef.current.readyState === 'open') {
            const createResponseEvent = {
              type: "response.create",
              response: {
                modalities: ["audio", "text"] // Enable both audio and text
              }
            };
            dcRef.current.send(JSON.stringify(createResponseEvent));
          }
          break;
          
        case "input_audio_buffer.speech_started":
          console.log("Speech detected");
          break;
          
        case "input_audio_buffer.speech_stopped":
          console.log("Speech ended");
          break;
          
        case "conversation.item.input_audio_transcription.delta":
          // Handle real-time transcription from conversation item
          if (data.delta && onTranscription) {
            console.log("Transcription delta:", data.delta);
            // Add a space before the new text if it's a new sentence
            if (data.delta.trim() && data.delta.match(/^[A-Z]/)) {
              onTranscription(" " + data.delta);
            } else {
              onTranscription(data.delta);
            }
          }
          break;
          
        case "response.audio_transcript.delta":
          // Handle real-time transcription from response
          if (data.delta && onTranscription) {
            console.log("Audio transcript delta:", data.delta);
            // Add a space before the new text if it's a new sentence
            if (data.delta.trim() && data.delta.match(/^[A-Z]/)) {
              onTranscription(" " + data.delta);
            } else {
              onTranscription(data.delta);
            }
          }
          break;
          
        case "conversation.item.input_audio_transcription.completed":
          // Handle completed transcription - don't append to avoid duplication
          if (data.transcript && onTranscription) {
            console.log("Completed transcription:", data.transcript);
            // Don't append the full transcript again to avoid duplication
            // The delta events should have already built up the transcript
          }
          break;
          
        case "input_audio_buffer.committed":
          console.log("Audio buffer committed");
          break;
          
        case "response.text.delta":
          // Handle AI response text
          if (data.delta && onAIResponse) {
            console.log("Text delta:", data.delta);
            onAIResponse(data.delta);
          }
          break;
          
        case "response.audio.delta":
          // Handle audio chunks from the model
          if (data.delta) {
            console.log("Received audio chunk from AI");
            try {
              playAudioChunk(data.delta);
              setState(prev => ({ ...prev, isAISpeaking: true }));
            } catch (error) {
              console.error("Error playing audio chunk:", error);
            }
          }
          break;
          
        case "response.audio.done":
          // Audio response complete
          console.log("AI audio response complete");
          setState(prev => ({ ...prev, isAISpeaking: false }));
          break;
          
        case "error":
          console.error("Realtime API error:", data);
          toast.error("Voice service error");
          break;
      }
    } catch (error) {
      console.error("Error handling realtime event:", error);
    }
  }, [onTranscription, onAIResponse]);

  // Play audio chunk from base64 encoded data
  const playAudioChunk = (base64Audio: string) => {
    console.log("Playing audio chunk, length:", base64Audio.length);
    
    try {
      // Convert base64 to audio buffer
      const audioData = atob(base64Audio);
      console.log("Decoded base64 data, length:", audioData.length);
      
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      
      // Create audio context and play
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log("Created audio context");
      
      audioContext.decodeAudioData(arrayBuffer, (buffer) => {
        console.log("Successfully decoded audio data, duration:", buffer.duration);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        console.log("Started playing audio");
      }, (error) => {
        console.error("Error decoding audio data:", error);
      });
    } catch (error) {
      console.error("Error playing audio chunk:", error);
      throw error; // Re-throw to be caught by the caller
    }
  };

  // Stop recording
  const stopRecording = useCallback(() => {
    if (pcRef.current) {
      // Remove all audio senders
      const senders = pcRef.current.getSenders();
      senders.forEach(sender => {
        if (sender.track && sender.track.kind === 'audio') {
          sender.track.stop();
          pcRef.current?.removeTrack(sender);
        }
      });
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setState(prev => ({ ...prev, isRecording: false }));
  }, []);

  // Send a session update event
  const updateSession = useCallback((updates: any) => {
    if (dcRef.current && dcRef.current.readyState === 'open') {
      const event = {
        type: "session.update",
        session: updates
      };
      dcRef.current.send(JSON.stringify(event));
    }
  }, []);
  
  // Send a message to the AI
  const sendMessage = useCallback((message: string) => {
    if (dcRef.current && dcRef.current.readyState === 'open') {
      try {
        // Create a conversation item with the user's message
        const createItemEvent = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: message,
              }
            ]
          }
        };
        dcRef.current.send(JSON.stringify(createItemEvent));
        
        // Create a response to get the AI to respond
        const createResponseEvent = {
          type: "response.create",
          response: {
            modalities: ["audio", "text"]
          }
        };
        dcRef.current.send(JSON.stringify(createResponseEvent));
        
        console.log("Sent message to AI:", message);
        return true;
      } catch (error) {
        console.error("Error sending message to AI:", error);
        return false;
      }
    }
    return false;
  }, []);

  // Change voice
  const setVoice = useCallback((voice: string) => {
    setState(prev => ({ ...prev, voice }));
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (audioElRef.current) {
        audioElRef.current.srcObject = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    isConnected: state.isConnected,
    isRecording: state.isRecording,
    isProcessing: state.isProcessing,
    isAISpeaking: state.isAISpeaking,
    voice: state.voice,
    startRecording,
    stopRecording,
    updateSession,
    setVoice,
    sendMessage,
  };
}