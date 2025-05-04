# Voice Integration

This document describes the voice integration feature in the AI chatbot, which allows users to have speech-to-speech conversations with the AI.

## Overview

The voice integration feature uses OpenAI's Realtime API to enable:

1. **Speech-to-Text**: Users can speak into their microphone and have their speech transcribed in real-time
2. **Speech-to-Speech**: Users can have full bidirectional voice conversations with the AI

## Components

The voice integration consists of several components:

### API Endpoint

- `app/api/voice/session/route.ts`: Creates a session with OpenAI's Realtime API and returns an ephemeral token for client-side use

### React Components

- `VoiceRecordButton`: Button for starting and stopping voice recording
- `TranscriptionDisplay`: Displays the transcription of the user's speech
- `VoiceConversation`: Manages the full speech-to-speech conversation experience
- `HeadphonesIcon`: Icon for the voice conversation mode toggle button

### Hooks

- `useVoiceCapture`: React hook that manages the WebRTC connection to OpenAI's Realtime API

## Usage Modes

The voice integration supports two modes:

### 1. Speech-to-Text Mode

In this mode, the user's speech is transcribed and sent as a text message to the AI. The AI responds with text.

1. Click the microphone button to start recording
2. Speak your message
3. Click the stop button to end recording
4. The transcription will be sent as a message to the AI

### 2. Speech-to-Speech Conversation Mode

In this mode, the user can have a full bidirectional voice conversation with the AI.

1. Click the headphones button to enable conversation mode
2. Click the microphone button to start speaking
3. The AI will respond with both text and speech
4. Continue the conversation by speaking again

## Technical Implementation

### WebRTC Connection

The voice integration uses WebRTC to establish a real-time connection with OpenAI's Realtime API:

1. The client requests an ephemeral token from the server
2. The server uses its API key to request a token from OpenAI
3. The client uses the token to establish a WebRTC connection
4. Audio is streamed to OpenAI for transcription and AI responses
5. The AI's responses are streamed back as both text and audio

### Voice Activity Detection (VAD)

The Realtime API includes voice activity detection to automatically detect when the user has started or stopped speaking. This enables a more natural conversation flow.

### Database Schema

The voice sessions are stored in the database with the following schema:

```sql
CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  session_token TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);
```

## Configuration

The voice integration can be configured with the following options:

- **Voice**: The voice used for the AI's responses (alloy, echo, fable, onyx, nova, shimmer)
- **Turn Detection**: Parameters for voice activity detection
- **Transcription Model**: The model used for transcription (gpt-4o-transcribe, gpt-4o-mini-transcribe)

## Limitations

- The voice integration requires a microphone and speakers
- The maximum duration of a Realtime session is 30 minutes
- The voice integration is only available in the "capture" chat type
