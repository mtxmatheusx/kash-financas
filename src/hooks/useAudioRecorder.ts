import { useState, useRef, useCallback, useEffect } from "react";

interface UseAudioRecorderOptions {
  onRecordingComplete?: (base64Audio: string, mimeType: string) => void;
  onError?: (error: string) => void;
  maxDurationMs?: number;
}

export function useAudioRecorder({
  onRecordingComplete,
  onError,
  maxDurationMs = 120_000, // 2 min default
}: UseAudioRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    timerRef.current = null;
    maxTimerRef.current = null;
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    mediaRecorderRef.current = null;
  }, []);

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // strip data:...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const start = useCallback(async () => {
    if (isRecording || isSending) return;

    try {
      // CRITICAL: getUserMedia called directly in click handler context
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        cleanup();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        setIsRecording(false);

        if (blob.size === 0) {
          onError?.("Nenhum áudio capturado.");
          return;
        }

        try {
          setIsSending(true);
          const base64 = await blobToBase64(blob);
          onRecordingComplete?.(base64, mimeType);
        } catch {
          onError?.("Erro ao processar áudio.");
        } finally {
          setIsSending(false);
        }
      };

      recorder.onerror = () => {
        cleanup();
        setIsRecording(false);
        onError?.("Erro durante gravação de áudio.");
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsRecording(true);
      setDuration(0);

      // Duration counter
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

      // Auto-stop at max duration
      maxTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, maxDurationMs);
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        onError?.("Permissão de microfone negada. Verifique as configurações do navegador.");
      } else {
        onError?.("Não foi possível acessar o microfone.");
      }
    }
  }, [isRecording, isSending, maxDurationMs, onRecordingComplete, onError, cleanup]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      cleanup();
    };
  }, [cleanup]);

  return { isRecording, isSending, duration, start, stop };
}
