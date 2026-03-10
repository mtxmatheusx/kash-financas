import { useState, useCallback, useRef, useEffect } from "react";

interface UseSpeechToTextOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useSpeechToText({ lang = "pt-BR", onResult, onError }: UseSpeechToTextOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(() => {
    if (!isSupported) {
      onError?.("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      setTranscript(interimTranscript || finalTranscript);
      if (finalTranscript) {
        onResult?.(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error !== "aborted") {
        onError?.(event.error === "not-allowed" 
          ? "Permissão de microfone negada." 
          : `Erro: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, lang, onResult, onError]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  return { isListening, transcript, start, stop, isSupported };
}
