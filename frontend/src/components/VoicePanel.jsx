import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

/* Transcript, spoken reply, and the text fallback.
 *
 * The fallback box is not a nicety — if the venue is loud or the mic
 * permission prompt misfires, this is what keeps the demo alive.
 */
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

  return (
    <div className="space-y-3">
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

      {voice.error === "no-stt" && (
        <p className="deva text-[12.5px] text-clay-500">
          इस ब्राउज़र में माइक काम नहीं करता — नीचे लिखकर भेजिए।
        </p>
      )}

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
