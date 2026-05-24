import { useState, useEffect, useRef } from "react";

interface UseCameraReturn {
    stream: MediaStream | null;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    error: string | null;
    isReady: boolean;
}

export function useCamera(): UseCameraReturn {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let localStream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: "user" },
                    audio: true, 
                });

                setStream(localStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = localStream;
                    videoRef.current.onloadedmetadata = () => setIsReady(true);
                }
            } catch (err) {
                setError(
                    "Camera access denied. Please allow camera access to proceed with the interview."
                );
            }
        };

        startCamera();

        return () => {
            localStream?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    return { stream, videoRef, error, isReady };
}