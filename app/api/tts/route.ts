'use server';

import { auth } from '@/app/(auth)/auth';
import { recordMetricEvent } from '@/lib/services/metrics-service';

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const { text, voice = 'alloy' } = await request.json();
    
    console.log(`TTS API received request: voice=${voice}, text length=${text?.length || 0}`);
    
    if (!text || typeof text !== 'string') {
      console.error('TTS API error: Text is required');
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Clean the text - remove excessive whitespace and trim
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    
    if (cleanedText.length === 0) {
      console.error('TTS API error: Text is empty after cleaning');
      return new Response(JSON.stringify({ error: 'Text is empty after cleaning' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Limit text length to prevent abuse
    const limitedText = cleanedText.slice(0, 4000);
    
    console.log(`TTS API processing: cleaned text length=${cleanedText.length}, limited text length=${limitedText.length}`);
    
    // Call OpenAI TTS API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice,
        input: limitedText
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from OpenAI TTS API:', errorData);
      return new Response(JSON.stringify({
        error: 'Failed to generate speech',
        details: errorData
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('TTS API: Successfully received response from OpenAI');
    
    // Record metric for TTS usage
    if (session.user.id) {
      void recordMetricEvent({
        userId: session.user.id,
        eventType: 'tts_usage',
        category: 'voice',
        action: 'tts_generated',
        metadata: { voice, textLength: limitedText.length }
      });
    }
    
    // Return the audio directly
    const audioBuffer = await response.arrayBuffer();
    
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.error('TTS API error: Received empty audio buffer from OpenAI');
      return new Response(JSON.stringify({ error: 'Received empty audio from OpenAI' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`TTS API: Returning audio buffer of size ${audioBuffer.byteLength} bytes`);
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    return new Response(JSON.stringify({ error: 'Error generating speech' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}