"use client"; // This directive is necessary for React hooks in Next.js App Router

import React, { useState, useRef } from 'react';
import StreamingAvatar, {
  StartAvatarRequest,
  STTProvider,
  StreamingEvents,
  UserTalkingMessageEvent,
} from '@heygen/streaming-avatar';

// Configuration for the Avatar and STT service
// This tells Heygen's backend to use Deepgram for STT.
const sttConfiguration: StartAvatarRequest = {
  avatarName: "default", // A default avatar is required for the session
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
    language: "hi", // You can change the language here
  },
};

export default function SpeechToTextPage() {
  const [transcribedText, setTranscribedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarRef = useRef<StreamingAvatar | null>(null);

  // Fetches the temporary access token from our secure backend API route
  const fetchAccessToken = async (): Promise<string> => {
    const response = await fetch("/api/get-access-token", { method: "POST" });
    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Failed to fetch access token: ${errorMsg}`);
    }
    return response.text();
  };

  const startSttSession = async () => {
    if (isListening || avatarRef.current) {
      console.log("Session is already active.");
      return;
    }
    
    setError(null);
    setTranscribedText(''); // Clear previous text

    try {
      const token = await fetchAccessToken();

      // Initialize the Heygen StreamingAvatar SDK
      const avatar = new StreamingAvatar({ token });
      avatarRef.current = avatar;

      // Set up the event listener to receive transcribed text
      avatar.on(
        StreamingEvents.USER_TALKING_MESSAGE,
        ({ detail }: { detail: UserTalkingMessageEvent }) => {
          // Append the new transcribed text chunk to our state
          setTranscribedText((prevText) => (prevText + ' ' + detail.message).trim());
        }
      );
      
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, (event) => {
        console.warn("Stream disconnected:", event.detail);
        stopSttSession();
        setError("Connection lost. Please start a new session.");
      });

      // Start the session with our STT configuration
      await avatar.createStartAvatar(sttConfiguration);

      // Activate the microphone to begin the STT process
      await avatar.startVoiceChat();

      setIsListening(true);
      console.log("STT Session Started. Listening for speech...");

    } catch (err: any) {
      console.error("Error starting STT session:", err);
      setError(err.message || "An unknown error occurred.");
      setIsListening(false);
      avatarRef.current = null;
    }
  };

  const stopSttSession = async () => {
    if (!avatarRef.current) return;
    
    // Clean up resources and gracefully end the session
    avatarRef.current.closeVoiceChat();
    await avatarRef.current.stopAvatar();
    avatarRef.current = null; // Clear the reference for the next session
    
    setIsListening(false);
    console.log("STT Session Stopped.");
  };

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#121212' }}>
      <div style={{ width: '100%', maxWidth: '600px', padding: '2rem', fontFamily: 'sans-serif', border: '1px solid #333', borderRadius: '12px', backgroundColor: '#1a1a1a', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        <h1 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Heygen STT Implementation</h1>
        <p style={{ textAlign: 'center', color: '#aaa', marginTop: 0, marginBottom: '2rem' }}>
          Uses your Heygen API key on the backend to power real-time speech-to-text.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={startSttSession} 
            disabled={isListening}
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: isListening ? 'not-allowed' : 'pointer', backgroundColor: isListening ? '#555' : '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', transition: 'background-color 0.2s' }}
          >
            Start Listening
          </button>
          <button 
            onClick={stopSttSession} 
            disabled={!isListening}
            style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: !isListening ? 'not-allowed' : 'pointer', backgroundColor: !isListening ? '#555' : '#f44336', color: 'white', border: 'none', borderRadius: '8px', transition: 'background-color 0.2s' }}
          >
            Stop Listening
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <strong>Status:</strong> 
          <span style={{ marginLeft: '0.5rem', color: isListening ? '#4CAF50' : '#f44336', fontWeight: 'bold' }}>
            {isListening ? 'LISTENING' : 'INACTIVE'}
          </span>
        </div>
        
        {error && <p style={{ color: '#ff8a80', textAlign: 'center' }}>Error: {error}</p>}
        
        <div style={{ border: '1px solid #444', padding: '1rem', minHeight: '150px', borderRadius: '8px', backgroundColor: '#2a2a2a' }}>
          <strong>Transcribed Text:</strong>
          <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', color: '#e0e0e0' }}>{transcribedText || "..."}</p>
        </div>
      </div>
    </main>
  );
}