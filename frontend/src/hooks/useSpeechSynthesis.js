// useSpeechSynthesis.js
// React hook wrapping text-to-speech playback for AI responses.

import { useState, useCallback } from "react";
import { speak, stopSpeaking, isSpeechSynthesisSupported } from "../services/speechService";

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSupported = isSpeechSynthesisSupported();

  const speakText = useCallback(
    (text) => {
      if (!isSupported || !text) return;

      speak(text, {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
      setIsSpeaking(true);
    },
    [isSupported]
  );

  const cancel = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return { speakText, cancel, isSpeaking, isSupported };
}