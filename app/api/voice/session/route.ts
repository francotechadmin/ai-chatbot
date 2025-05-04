'use server';

import { auth } from '@/app/(auth)/auth';
import { recordMetricEvent } from '@/lib/services/metrics-service';

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const { chatId, voice = 'alloy' } = await request.json();
    
    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "realtime=v1"
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime", // Use the base model name without preview version
        voice: voice,
        // Configure for full conversation mode with both audio and text
        modalities: ["audio", "text"], // Enable both modalities
        // Add configuration for turn detection with auto-response
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
          create_response: true, // Auto-respond when user stops speaking
          interrupt_response: true // Allow interruptions
        },
        // Keep transcription configuration
        input_audio_transcription: {
          model: "gpt-4o-transcribe",
          language: "en"
        }
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from OpenAI:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to create voice session' }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await response.json();
    
    // Record metric for voice session creation
    if (session.user.id) {
      void recordMetricEvent({
        userId: session.user.id,
        eventType: 'voice_session',
        category: 'voice',
        action: 'session_created',
        metadata: { chatId }
      });
    }
    
    return Response.json(data);
  } catch (error) {
    console.error('Error creating voice session:', error);
    return new Response(JSON.stringify({ error: 'Error creating voice session' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}