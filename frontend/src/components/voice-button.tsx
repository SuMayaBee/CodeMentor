"use client"
import { useState, useRef, useEffect } from "react";

const VoiceButton = () => {
  const [voice, setVoice] = useState("ash");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [status, setStatus] = useState("");
  const [isReconnecting, setIsReconnecting] = useState(false);
  const audioIndicatorRef = useRef<HTMLDivElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    audioElementRef.current = new Audio();
    audioElementRef.current.autoplay = true;

    return () => {
      stopSession();
      if (audioElementRef.current) {
        audioElementRef.current.remove();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const getEphemeralToken = async () => {
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to get token');
      const data = await response.json();
      return data.client_secret.value;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  };

  const setupAudioVisualization = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateIndicator = () => {
        if (!audioContext || !isSessionActive) return;
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        
        if (audioIndicatorRef.current) {
          audioIndicatorRef.current.classList.toggle("active", average > 30);
        }
        requestAnimationFrame(updateIndicator);
      };

      updateIndicator();
      audioContextRef.current = audioContext;
    } catch (error) {
      console.error('Audio visualization error:', error);
    }
  };

  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'failed' && !isReconnecting) {
        setIsReconnecting(true);
        setStatus('Connection failed - retrying...');
        reconnectTimeoutRef.current = setTimeout(() => {
          stopSession();
          startSession();
          setIsReconnecting(false);
        }, 2000);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' && !isReconnecting) {
        setIsReconnecting(true);
        setStatus('Connection interrupted - reconnecting...');
        reconnectTimeoutRef.current = setTimeout(() => {
          stopSession();
          startSession();
          setIsReconnecting(false);
        }, 2000);
      }
    };

    return pc;
  };

  const startSession = async () => {
    try {
      if (isSessionActive || isReconnecting) return;
      
      setStatus("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      });
      
      audioStreamRef.current = stream;
      setupAudioVisualization(stream);
  
      setStatus("Fetching token...");
      const token = await getEphemeralToken();
  
      setStatus("Establishing connection...");
      const pc = setupPeerConnection();
      
      // Ensure audio element exists and is configured
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }
      audioElementRef.current.autoplay = true;
      audioElementRef.current.volume = 1.0;
  
      // Handle incoming audio stream
      pc.ontrack = (event) => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = event.streams[0];
          const playPromise = audioElementRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Audio playback error:', error);
              setStatus('Audio playback failed - please try again');
            });
          }
        }
      };
  
      // Add local audio track to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
  
      // Create and set local description
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      await pc.setLocalDescription(offer);
  
      // Wait for ICE gathering to complete
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('ICE gathering timed out'));
        }, 5000);
  
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timeoutId);
          resolve();
        } else {
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') {
              clearTimeout(timeoutId);
              resolve();
            }
          };
        }
      });
  
      // Send offer to server
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const response = await fetch(`https://api.openai.com/v1/realtime?model=${model}&voice=${voice}`, {
        method: "POST",
        body: pc.localDescription?.sdp,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${await response.text()}`);
      }
  
      // Set remote description from server response
      const answer = await response.text();
      await pc.setRemoteDescription({
        type: "answer",
        sdp: answer,
      });
  
      // Store peer connection and update state
      peerConnectionRef.current = pc;
      setIsSessionActive(true);
      setStatus("Connected!");
  
    } catch (err: any) {
      console.error('Session error:', err);
      setStatus(`Error: ${err.message}`);
      stopSession();
      
      // Attempt to reconnect if appropriate
      if (!isReconnecting && err.message !== 'User denied microphone access') {
        setIsReconnecting(true);
        reconnectTimeoutRef.current = setTimeout(() => {
          setIsReconnecting(false);
          startSession();
        }, 2000);
      }
    }
  };

  const stopSession = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }

    if (audioIndicatorRef.current) {
      audioIndicatorRef.current.classList.remove("active");
    }

    setIsSessionActive(false);
    setIsReconnecting(false);
    setStatus("");
  };

  const handleSession = () => {
    if (isSessionActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleSession}
        disabled={isReconnecting}
        className={`px-4 py-2 rounded-full transition-colors duration-200 flex items-center gap-2
          ${isSessionActive 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-violet-500 hover:bg-violet-600'}
          ${isReconnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div 
          ref={audioIndicatorRef}
          className={`w-2 h-2 rounded-full transition-all duration-200
            ${isSessionActive ? 'bg-red-200 animate-pulse' : 'bg-violet-200'}`} 
        />
        <span className="text-white text-sm">
          {isReconnecting ? 'Reconnecting...' : isSessionActive ? 'Stop' : 'Talk with mentor'}
        </span>
      </button>
      
      {status && (
        <div className="absolute top-full mt-2 right-0 min-w-[200px] p-2 rounded-md text-sm bg-gray-900/80 backdrop-blur border border-violet-500/20">
          <p className={`${status.startsWith('Error') ? 'text-red-400' : 'text-violet-400'}`}>
            {status}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceButton;