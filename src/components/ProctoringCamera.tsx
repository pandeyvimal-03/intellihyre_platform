import { useEffect, useRef } from "react";

interface Props {
    stream: MediaStream | null;
    isActive: boolean;
}

export function ProctoringCamera({ stream, isActive }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative w-48 h-36 rounded-xl overflow-hidden border-2 border-gray-700 bg-black">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]" // mirror effect
            />

            {/* Status indicator */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <span
                    className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-red-500"
                        }`}
                />
                <span className="text-white text-xs">
                    {isActive ? "Proctoring Active" : "Camera Off"}
                </span>
            </div>
        </div>
    );
}