import { useEffect, useRef, useState, useCallback } from 'react';

export type InterviewMessageType = 'question' | 'end' | 'warning' | 'error' | 'proctoring_warning' | 'transcript' | 'nudge' | 'session_started';

export interface InterviewMessage {
  type: InterviewMessageType;
  data?: string;
  message?: string;
  event?: string;
  index?: number;
  session_id?: number;
}

export const useInterviewSocket = (token: string | undefined) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL}/api/v1/ws/interview/${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to Interview Socket');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);

      if (message.type === 'question') {
        setLastQuestion(message.data);
      } else if (message.type === 'nudge') {
        setLastQuestion(message.message);
      }

      if (message.session_id) {
        setSessionId(message.session_id);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from Interview Socket');
      setIsConnected(false);
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [token]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  return { isConnected, messages, lastQuestion, sendMessage, sessionId };
};
