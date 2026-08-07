// useSpeechRecognition.js
// React hook wrapping the SpeechRecognition service.
// Exposes transcript, listening state, and start/stop controls.

import { useState, useRef, useCallback, useEffect } from "react";
import { createRecognizer, isSpeechRecognitionSupported } from "../services/speechService";

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognizerRef = useRef(null);

  const isSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    setError(null);

    if (!isSupported) {
      setError("Speech recognition isn't supported in this browser. Try Chrome.");
      return;
    }

    setTranscript("");
    const recognizer = createRecognizer();
    recognizerRef.current = recognizer;

    recognizer.onstart = () => setIsListening(true);

    recognizer.onresult = (event) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognizer.onerror = (event) => {
      setIsListening(false);
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setError("Microphone access was denied. Please allow microphone permission.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else {
        setError("Speech recognition failed. Please try again.");
      }
    };

    recognizer.onend = () => setIsListening(false);

    try {
      recognizer.start();
    } catch (e) {
      setError("Could not start microphone. Please try again.");
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => setTranscript(""), []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}