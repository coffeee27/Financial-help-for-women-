import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

/* Transcript, spoken reply, the text fallback — and, critically, why the mic
 * failed when it does.
 *
 * A dead mic with no message looks like a broken app on stage. It is almost
 * always a denied permission, which is recoverable in ten seconds if the
 * screen actually says so.
 */

const MIC_ERRORS = {
  "no-stt": {
    hi: "इस ब्राउज़र में माइक काम नहीं करता।",
    en: "Speech recognition needs Chrome or Edge. Type below instead.",
  },
  "not-allowed": {
    hi: "माइक की अनुमति नहीं मिली।",
    en: "Click the padlock in the address bar → Site settings → Microphone → Allow, then reload. A dismissed prompt counts as blocked.",
  },
  "service-not-allowed": {
    hi: "माइक की अनुमति नहीं मिली।",
    en: "Speech service blocked. Check the padlock in the address bar → Microphone → Allow.",
  },
  "audio-capture": {
    hi: "माइक नहीं मिला।",
    en: "No microphone detected. Check it's plugged in and not claimed by another app.",
  },
  "no-speech": {
    hi: "कोई आवाज़ नहीं सुनाई दी। दोबारा बोलिए।",
    en: "Nothing heard — tap and speak a little sooner.",
  },
  network: {
    hi: "आवाज़ पहचानने की सेवा तक नहीं पहुँच पाई।",
    en: "Chrome sends audio to Google to transcribe — this needs internet. Type below if the venue wifi is down.",
  },
  aborted: { hi: "सुनना रुक गया।", en: "Recognition aborted — tap the mic again." },
  "already-running": { hi: "पहले से सुन रहा था।", en: "Recogniser was still running — tap again." },
  "start-failed": { hi: "माइक शुरू नहीं हो पाया।", en: "Could not start recognition — tap again." },
};

export default function VoicePanel({ voice }) {
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    voice.send(text);
    setText("");
  };

  const sourceLabel = {
    local: "local ledger · no network",
    groq: "groq",
    fallback: "offline fallback",
    rules: "keyword rules",
  };

  const err = voice.error ? MIC_ERRORS[voice.error] : null;
  const blocked = voice.micPermission === "denied";

  return (
    <div className="space-y-3">
      {/* permission trouble, shown before she even taps */}
      {(blocked || err) && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-clay-400/50 bg-clay-500/[.07] px-5 py-3.5"
        >
          <p className="deva text-[14px] text-clay-600 font-medium">
            {err ? err.hi : "माइक की अनुमति बंद है।"}
          </p>
          <p className="text-[11.5px] text-bark-500 mt-1 leading-relaxed">
            {err
              ? err.en
              : "Microphone is blocked for this site. Padlock in the address bar → Site settings → Microphone → Allow, then reload."}
          </p>
          {voice.error && !MIC_ERRORS[voice.error] && (
            <p className="text-[10px] text-bark-300 mt-1.5 font-mono">code: {voice.error}</p>
          )}
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {voice.transcript && (
          <motion.div
            key="transcript"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-3xl bg-sand-300/60 px-5 py-3.5"
          >
            <div className="deva text-[9.5px] tracking-[.2em] uppercase text-bark-500 mb-1">
              आपने कहा
            </div>
            <p className="deva text-[15px] text-bark-700">{voice.transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {voice.reply && (
          <motion.div
            key={voice.reply}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl bg-sand-50 shadow-card
                       border border-clay-300/40 px-5 py-4"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "220%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r
                         from-transparent via-clay-300/20 to-transparent"
            />
            <div className="relative flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-clay-500/12
                              flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B4532A"
                     strokeWidth="2.2" strokeLinecap="round">
                  <path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="deva text-[15.5px] leading-relaxed text-bark-900">{voice.reply}</p>
                {voice.meta && (
                  <p className="text-[10px] text-bark-300 mt-2 tracking-wide">
                    {voice.meta.intent} · {sourceLabel[voice.meta.source]} · {voice.meta.ms}ms
                    {voice.meta.repaired && " · numbers repaired"}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="या यहाँ लिखिए…"
          className="deva flex-1 min-w-0 rounded-2xl bg-sand-50 border border-sand-300
                     px-4 py-3 text-[14.5px] text-bark-900 placeholder:text-bark-300
                     focus:outline-none focus:border-clay-400"
        />
        <button
          type="submit"
          disabled={voice.thinking}
          className="deva rounded-2xl bg-bark-900 px-5 text-[14.5px] font-medium text-sand-50
                     disabled:opacity-40"
        >
          भेजें
        </button>
      </form>
    </div>
  );
}
