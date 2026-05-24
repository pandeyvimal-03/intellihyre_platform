import { useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";
import { proctoringService, ProctoringEventType } from "@/services/proctoringService";

interface UseProctoringOptions {
    sessionId: number;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    onWarning: (event: ProctoringEventType, message: string) => void;
    enabled?: boolean;
    intervalMs?: number; // how often to analyze frames, default 3000ms
}

const WARNING_MESSAGES: Record<ProctoringEventType, string> = {
    NO_FACE: "Your face is not visible. Please face the camera.",
    MULTI_FACE: "Multiple faces detected. Only you should be visible.",
    LOOKING_AWAY: "Please keep your eyes on the screen.",
    TAB_SWITCH: "Tab switching is not allowed during the interview.",
    FULLSCREEN_EXIT: "Please remain in fullscreen mode during the interview.",
};

export function useProctoring({
    sessionId,
    videoRef,
    onWarning,
    enabled = true,
    intervalMs = 3000,
}: UseProctoringOptions) {
    const modelsLoaded = useRef(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));

    // ── Load face-api.js models ──────────────────────────────────────────
    const loadModels = useCallback(async () => {
        if (modelsLoaded.current) return;
        const MODEL_URL = "/models"; // place models in public/models/
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
            ]);
            modelsLoaded.current = true;
            console.log("Proctoring models loaded successfully");
        } catch (error) {
            console.error("Failed to load proctoring models. Ensure weights are in public/models/", error);
            // Optionally notify the user or the component
            onWarning("NO_FACE", "Proctoring system failed to initialize. Please check your connection.");
        }
    }, [onWarning]);

    // ── Send event to backend ────────────────────────────────────────────
    const sendEvent = useCallback(
        async (eventType: ProctoringEventType, severity: "low" | "medium" | "high") => {
            try {
                await proctoringService.logEvent({
                    session_id: sessionId,
                    event_type: eventType,
                    severity,
                });
            } catch {
                // silently fail — do not interrupt interview for a logging failure
            }
        },
        [sessionId]
    );

    // ── Trigger warning locally + send to backend ─────────────────────────
    const triggerViolation = useCallback(
        (eventType: ProctoringEventType, severity: "low" | "medium" | "high") => {
            onWarning(eventType, WARNING_MESSAGES[eventType]);
            sendEvent(eventType, severity);
        },
        [onWarning, sendEvent]
    );

    // ── Analyze a single video frame ─────────────────────────────────────
    const analyzeFrame = useCallback(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;

        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true); // tiny landmark net

        const numFaces = detections.length;

        if (numFaces === 0) {
            triggerViolation("NO_FACE", "high");
            return;
        }

        if (numFaces > 1) {
            triggerViolation("MULTI_FACE", "high");
            return;
        }

        // ── Head pose estimation via nose/eye landmarks ───────────────────
        // If nose tip is significantly outside the eye line horizontally,
        // the candidate is looking away
        const landmarks = detections[0].landmarks;
        const nose = landmarks.getNose()[3]; // nose tip point
        const leftEye = landmarks.getLeftEye()[0];
        const rightEye = landmarks.getRightEye()[3];

        const eyeCenterX = (leftEye.x + rightEye.x) / 2;
        const eyeSpan = Math.abs(rightEye.x - leftEye.x);
        const horizontalOffset = Math.abs(nose.x - eyeCenterX);

        // If nose is offset more than 40% of eye span, candidate is looking away
        if (horizontalOffset > eyeSpan * 0.4) {
            triggerViolation("LOOKING_AWAY", "medium");
        }
    }, [videoRef, triggerViolation]);

    // ── Browser visibility change (tab switch) ───────────────────────────
    useEffect(() => {
        if (!enabled) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                triggerViolation("TAB_SWITCH", "high");
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [enabled, triggerViolation]);

    // ── Fullscreen exit detection ─────────────────────────────────────────
    useEffect(() => {
        if (!enabled) return;

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                triggerViolation("FULLSCREEN_EXIT", "medium");
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [enabled, triggerViolation]);

    // ── Start/stop frame analysis interval ───────────────────────────────
    useEffect(() => {
        if (!enabled) return;

        let active = true;

        const start = async () => {
            await loadModels();
            if (!active) return;
            intervalRef.current = setInterval(() => {
                analyzeFrame();
            }, intervalMs);
        };

        start();

        return () => {
            active = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [enabled, intervalMs, loadModels, analyzeFrame]);
}