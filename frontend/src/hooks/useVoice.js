import { useCallback, useEffect, useRef, useState } from "react";
import { processInput, speak, SpeechRecognitionAPI } from "../lib/voiceEngine";

/* The whole voice layer, as one hook.
 *
 *   const { listening, transcript, reply, start, send } = useVoice(state, setState);
 *
 * Mic tap → start(). Text fallback → send("..."). Either way the ledger is
 * updated through goalService and the reply is spoken.
 *
 * Every failure path sets `error` to a code the UI can explain. Silent failure
 * is the worst outcome here: a dead mic with no message looks like a broken
 * app on stage, when it is usually just a denied permission.
 */
export function useVoice(state, setState) {
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [micPermission, setMicPermission] = useState("unknown");
  // a withdrawal she has asked for but not yet confirmed
  const [pending, setPending] = useState(null);

  const recognitionRef = useRef(null);
  // Ref so the recognition callback always sees current state, not the
  // snapshot captured when the mic started.
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  // same reason: send() is memoised, so read pending through a ref
  const pendingRef = useRef(pending);
  useEffect(() => { pendingRef.current = pending; }, [pending]);

  /* Chrome treats a *dismissed* permission prompt as a denial and will not ask
     again, which is the usual reason a mic that worked yesterday is dead
     today. Read it up front so the UI can say so instead of going quiet. */
  useEffect(() => {
    if (!navigator.permissions?.query) return;
    let cancelled = false;
    navigator.permissions
      .query({ name: "microphone" })
      .then((status) => {
        if (cancelled) return;
        setMicPermission(status.state);
        status.onchange = () => setMicPermission(status.state);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const send = useCallback(async (text) => {
    if (!text || !text.trim()) return;
    setTranscript(text);
    setThinking(true);
    setError(null);
    try {
      // the coach needs to know a withdrawal is waiting on her, so it can ask
      // what it's for and advise on that rather than answering in the abstract
      const res = await processInput(text, stateRef.current, { pending: pendingRef.current });
      setState(res.state);
      setReply(res.reply);
      setMeta({ intent: res.intent, source: res.source, ms: res.ms, repaired: res.repaired });
      if (res.pending) setPending(res.pending);
      speak(res.reply);
    } catch (e) {
      setError(e.message || "process-failed");
    } finally {
      setThinking(false);
    }
  }, [setState]);

  const stop = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionAPI) { setError("no-stt"); return; }
    if (listening) { stop(); return; }

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

    rec.onerror = (e) => {
      setListening(false);
      setError(e.error || "unknown");
      if (e.error === "not-allowed") setMicPermission("denied");
    };

    rec.onend = () => setListening(false);

    /* start() throws InvalidStateError if a previous session never ended.
       Without this the hook could get stuck with listening === true, and then
       every further tap would just call stop() and return — a mic that looks
       permanently dead. */
    try {
      rec.start();
    } catch (e) {
      setListening(false);
      setError(e.name === "InvalidStateError" ? "already-running" : "start-failed");
    }
  }, [listening, send, stop]);

  const clear = useCallback(() => {
    setReply(null); setTranscript(""); setMeta(null); setError(null);
  }, []);

  const clearPending = useCallback(() => setPending(null), []);

  return {
    listening, thinking, transcript, reply, meta, error, micPermission,
    pending, clearPending,
    start, stop, send, clear,
    sttSupported: !!SpeechRecognitionAPI,
  };
}
