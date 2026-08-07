import { useCallback, useEffect, useRef, useState } from "react";
import { processInput, speak, SpeechRecognitionAPI } from "../lib/voiceEngine";

/* The whole voice layer, as one hook.
 *
 *   const { listening, transcript, reply, start, send } = useVoice(state, setState);
 *
 * Mic tap → start(). Text fallback → send("..."). Either way the ledger is
 * updated through goalService and the reply is spoken.
 */
export function useVoice(state, setState) {
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  // Ref so the recognition callback always sees current state, not the
  // snapshot captured when the mic started.
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const send = useCallback(async (text) => {
    if (!text || !text.trim()) return;
    setTranscript(text);
    setThinking(true);
    setError(null);
    try {
      const res = await processInput(text, stateRef.current, {});
      setState(res.state);
      setReply(res.reply);
      setMeta({ intent: res.intent, source: res.source, ms: res.ms, repaired: res.repaired });
      speak(res.reply);
    } catch (e) {
      setError(e.message);
    } finally {
      setThinking(false);
    }
  }, [setState]);

  const start = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setError("no-stt");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const rec = new SpeechRecognitionAPI();
    recognitionRef.current = rec;
    rec.lang = "hi-IN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => { setListening(true); setError(null); setReply(null); };
    rec.onresult = (event) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      setTranscript(final || interim);
      if (final) send(final);
    };
    rec.onerror = (e) => { setListening(false); setError(e.error); };
    rec.onend = () => setListening(false);

    rec.start();
  }, [listening, send]);

  const clear = useCallback(() => { setReply(null); setTranscript(""); setMeta(null); }, []);

  return {
    listening, thinking, transcript, reply, meta, error,
    start, send, clear,
    sttSupported: !!SpeechRecognitionAPI,
  };
}
