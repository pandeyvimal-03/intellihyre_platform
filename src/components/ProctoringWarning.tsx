import { useEffect, useState } from "react";
import { ProctoringEventType } from "@/services/proctoringService";

interface Warning {
    id: number;
    event: ProctoringEventType;
    message: string;
}

interface Props {
    event: ProctoringEventType | null;
    message: string | null;
}

export function ProctoringWarning({ event, message }: Props) {
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        if (!event || !message) return;

        const id = counter + 1;
        setCounter(id);
        setWarnings((prev) => [...prev, { id, event, message }]);

        // Auto dismiss after 5 seconds
        const timer = setTimeout(() => {
            setWarnings((prev) => prev.filter((w) => w.id !== id));
        }, 5000);

        return () => clearTimeout(timer);
    }, [event, message]);

    if (warnings.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {warnings.map((warning) => (
                <div
                    key={warning.id}
                    className="flex items-start gap-3 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right"
                >
                    <span className="text-xl">⚠️</span>
                    <div>
                        <p className="font-semibold text-sm">{warning.event.replace("_", " ")}</p>
                        <p className="text-xs text-red-100">{warning.message}</p>
                    </div>
                    <button
                        onClick={() =>
                            setWarnings((prev) => prev.filter((w) => w.id !== warning.id))
                        }
                        className="ml-auto text-red-200 hover:text-white text-sm"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}