import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useInterviewSocket } from '@/hooks/useInterviewSocket';
import { useCamera } from '@/hooks/useCamera';
import { useProctoring } from '@/hooks/useProctoring';
import { ProctoringEventType } from '@/services/proctoringService';
import { ProctoringWarning } from '@/components/ProctoringWarning';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, AlertTriangle } from 'lucide-react';
import RecordRTC from 'recordrtc';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


const InterviewSessionPage = () => {
  const { token } = useParams<{ token: string }>();

  // ── Interview WebSocket ──────────────────────────────────────────────
  const { isConnected, lastQuestion, sendMessage, messages, sessionId } =
    useInterviewSocket(token);

  // ── Camera ───────────────────────────────────────────────────────────
  const { stream, videoRef, error: cameraError, isReady } = useCamera();

  // ── UI State ─────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const recorderRef = useRef<RecordRTC | null>(null);

  // Clear warning state on unmount
  useEffect(() => {
    return () => {
      setLastWarning(null);
    };
  }, []);

  // ── Proctoring Warning State ──────────────────────────────────────────
  const [lastWarning, setLastWarning] = useState<{
    event: ProctoringEventType;
    message: string;
  } | null>(null);

  const handleProctoringWarning = useCallback(
    (event: ProctoringEventType, message: string) => {
      setLastWarning({ event, message });
    },
    []
  );

  // ── Proctoring Hook ───────────────────────────────────────────────────
  // Runs face-api.js locally in browser — no frames sent to backend
  // Only events (NO_FACE, MULTI_FACE etc.) are sent to backend via HTTP POST
  useProctoring({
    sessionId: sessionId ?? 0,
    videoRef,
    onWarning: handleProctoringWarning,
    enabled: isReady && isConnected && isCameraOn,
    intervalMs: 3000,
  });

  // ── Text-to-Speech for AI Questions ──────────────────────────────────
  useEffect(() => {
    if (!lastQuestion) return;
    window.speechSynthesis.cancel(); // cancel any ongoing speech first
    const utterance = new SpeechSynthesisUtterance(lastQuestion);
    utterance.rate = 0.9;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }, [lastQuestion]);

  // ── Handle warnings coming from backend via WebSocket ────────────────
  // Backend sends proctoring_warning when it receives an event
  useEffect(() => {
    const latestWarning = messages.filter((m) => m.type === 'proctoring_warning').pop();
    if (latestWarning) {
      setLastWarning({
        event: latestWarning.event as ProctoringEventType,
        message: latestWarning.message || '',
      });
    }
  }, [messages]);

  // ── Request fullscreen on mount ───────────────────────────────────────
  useEffect(() => {
    document.documentElement.requestFullscreen().catch(() => {
      // Some browsers block this without user gesture — acceptable
    });
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }
    };
  }, []);

  // ── Audio Recording ───────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    if (!stream) return;

    recorderRef.current = new RecordRTC(stream, {
      type: 'audio',
      recorderType: RecordRTC.StereoAudioRecorder || RecordRTC.MediaStreamRecorder,
      numberOfAudioChannels: 1,
    });

    recorderRef.current.startRecording();
    setIsRecording(true);
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (!recorderRef.current) return;

    recorderRef.current.stopRecording(() => {
      const blob = recorderRef.current!.getBlob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = (reader.result as string).split(',')[1];
        sendMessage('answer_audio', base64Audio);
      };
      reader.readAsDataURL(blob);
      setIsRecording(false);
    });
  }, [sendMessage]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ── Camera error state ────────────────────────────────────────────────
  if (cameraError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Camera Access Required</h2>
          <p className="text-zinc-400 max-w-sm">{cameraError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 md:p-8">

      {/* Proctoring Warning Toasts — top right corner */}
      <ProctoringWarning
        event={lastWarning?.event ?? null}
        message={lastWarning?.message ?? null}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Badge
            variant={isConnected ? 'default' : 'destructive'}
            className="animate-pulse"
          >
            {isConnected ? 'LIVE' : 'DISCONNECTED'}
          </Badge>
          <h1 className="text-xl font-bold font-mono">INTELLIHIRE AI INTERVIEW</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCameraOn(!isCameraOn)}
          >
            {isCameraOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5 text-red-500" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMicOn(!isMicOn)}
          >
            {isMicOn ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5 text-red-500" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">

        {/* Main: Video + AI Question */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="bg-zinc-900 border-zinc-800 flex-1 overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={cn(
                'w-full h-full object-cover transition-opacity scale-x-[-1]',
                isCameraOn ? 'opacity-100' : 'opacity-0'
              )}
            />

            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <VideoOff className="w-20 h-20 text-zinc-700" />
              </div>
            )}

            {/* Proctoring active indicator */}
            {isReady && isCameraOn && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-xs">Proctoring Active</span>
              </div>
            )}
          </Card>

          {/* AI Question */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-primary text-sm font-bold mb-2 uppercase tracking-widest">
              AI Interviewer
            </h3>
            <p className="text-xl md:text-2xl leading-relaxed text-zinc-100 italic">
              {lastQuestion || 'Initializing interview...'}
            </p>
          </Card>
        </div>

        {/* Sidebar: Session log + Record button */}
        <div className="flex flex-col gap-6">
          <Card className="bg-zinc-900 border-zinc-800 p-6 flex-1 flex flex-col">
            <h3 className="text-zinc-400 text-sm font-bold mb-4 uppercase">
              Session Log
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    m.type === 'question'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : m.type === 'proctoring_warning'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : m.type === 'transcript'
                          ? 'bg-zinc-800 text-zinc-300'
                        : m.type === 'nudge'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-zinc-800/50 text-zinc-500'
                  )}
                >
                  <span className="font-bold uppercase text-[10px] block mb-1">
                    {m.type}
                  </span>
                  {m.data ?? m.message}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800">
              <Button
                size="lg"
                disabled={!isConnected}
                className={cn(
                  'w-full h-20 text-xl font-bold transition-all',
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary hover:bg-primary/90'
                )}
                onClick={toggleRecording}
              >
                {isRecording ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                    STOP & SUBMIT
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Mic className="w-6 h-6" />
                    START ANSWERING
                  </div>
                )}
              </Button>
              <p className="text-center text-xs text-zinc-500 mt-4">
                Click to record your answer. Your voice will be transcribed in real-time.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InterviewSessionPage;