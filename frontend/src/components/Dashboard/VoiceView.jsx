import { motion } from "framer-motion";
import MicButton from "./MicButton";
import VoicePanel from "../VoicePanel";

/* The voice tab.
 *
 * The tappable phrases are here for the demo as much as for her: a judge who
 * grabs the phone can try the product without knowing Hindi or trusting the
 * venue's microphone.
 */
const SUGGESTIONS = [
  { hi: "मेरी बचत कितनी है", en: "How much have I saved?" },
  { hi: "दो सौ बचाओ", en: "Save ₹200" },
  { hi: "बकरी के लिए और कितना चाहिए", en: "How much more for the goal?" },
  { hi: "अगर पति को पता चल गया तो", en: "What if he finds out?" },
];

export default function VoiceView({ voice }) {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 p-8
                   flex flex-col items-center"
      >
        <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 mb-6">
          Voice Coach
        </div>
        <MicButton
          listening={voice.listening}
          thinking={voice.thinking}
          onTap={voice.start}
          disabled={voice.thinking}
        />
        <p className="deva text-[13px] text-bark-500 mt-4 text-center">
          {voice.listening
            ? "सुन रही हूँ…"
            : voice.thinking
            ? "सोच रही हूँ…"
            : "हिंदी में बोलिए — कोई पढ़ना नहीं पड़ेगा"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
      >
        <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 mb-3 px-1">
          Try saying
        </div>
        <div className="space-y-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.hi}
              onClick={() => voice.send(s.hi)}
              disabled={voice.thinking}
              className="w-full text-left rounded-3xl bg-sand-50 border border-sand-300/70
                         px-5 py-3.5 hover:border-clay-400 transition-colors
                         disabled:opacity-50 shadow-card"
            >
              <div className="deva text-[15px] text-bark-900">{s.hi}</div>
              <div className="text-[11.5px] text-bark-500 mt-0.5">{s.en}</div>
            </button>
          ))}
        </div>
      </motion.div>

      <VoicePanel voice={voice} />
    </div>
  );
}
