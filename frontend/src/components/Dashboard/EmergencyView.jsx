import { motion } from "framer-motion";
import { emergencyWithdraw, weeksAtPace } from "../../services/goalService";
import { speak } from "../../lib/voiceEngine";
import VoicePanel from "../VoicePanel";

/* The pause between being asked for money and the money moving.
 *
 * Design rules, in order of importance:
 *
 * 1. It must never read as an accusation. If someone is standing over her,
 *    they can see this screen — "is someone forcing you?" would put her in
 *    more danger than no app at all. So it looks like an ordinary withdrawal
 *    review: the amount, what's left, what it costs the goal.
 *
 * 2. It must never trap her money. If she needs cash urgently, a app that
 *    argues with her is worse than one that just pays out. Confirm is one tap,
 *    the same weight as cancel, and never hidden behind a lecture.
 *
 * 3. Nothing moves until she says so. That is the entire feature.
 */
export default function EmergencyView({ state, setState, voice }) {
  const pending = voice.pending;
  const goal = state.goal;

  const after = pending ? Math.max(0, state.hiddenSavings - pending.amount) : state.hiddenSavings;
  const weeksNow = weeksAtPace(state);
  const weeksAfter = goal
    ? weeksAtPace({ ...state, goal: { ...goal, saved: Math.max(0, goal.saved - (pending?.amount || 0)) } })
    : null;
  const weeksCost = weeksNow != null && weeksAfter != null ? weeksAfter - weeksNow : null;

  const confirm = () => {
    const { state: next, refused } = emergencyWithdraw(state, pending.amount);
    if (!refused) {
      setState(next);
      speak(`${pending.amount} रुपये निकाल दिए गए हैं। अब ${next.hiddenSavings} रुपये बचे हैं।`);
    }
    voice.clearPending();
  };

  const cancel = () => {
    voice.clearPending();
    speak("ठीक है, पैसे तिजोरी में ही रहेंगे।");
  };

  return (
    <div className="space-y-4">
      {pending ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-5xl bg-sand-50 shadow-card border border-clay-400/40 p-7"
        >
          <div className="text-[10px] tracking-[.26em] uppercase text-bark-500">
            Withdrawal requested
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-2xl text-bark-500">₹</span>
            <span className="font-display text-[42px] leading-none font-semibold text-bark-900 tnum">
              {pending.amount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-sand-100 p-4">
              <div className="text-[9px] tracking-[.18em] uppercase text-bark-500">अभी</div>
              <div className="font-display text-[18px] font-semibold text-bark-900 tnum">
                ₹{state.hiddenSavings.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="rounded-3xl bg-sand-100 p-4">
              <div className="text-[9px] tracking-[.18em] uppercase text-bark-500">बाद में</div>
              <div className="font-display text-[18px] font-semibold text-clay-500 tnum">
                ₹{after.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {goal && weeksCost != null && weeksCost > 0 && (
            <p className="deva mt-5 text-[14px] leading-relaxed text-bark-700">
              {goal.name} लगभग{" "}
              <span className="font-semibold text-clay-600">{weeksCost} हफ्ते</span> और दूर हो जाएगी।
            </p>
          )}

          <p className="deva mt-2 text-[13px] leading-relaxed text-bark-500">
            पैसे आपके हैं। जो ठीक लगे वही कीजिए — जल्दी नहीं है।
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={cancel}
              className="deva rounded-3xl border border-sand-400 bg-sand-50 py-3.5
                         text-[15px] font-medium text-bark-700"
            >
              रहने दीजिए
            </button>
            <button
              onClick={confirm}
              className="deva rounded-3xl bg-clay-500 py-3.5 text-[15px] font-medium text-sand-50"
            >
              हाँ, निकालिए
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 p-8 text-center"
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-olive-500/15
                          flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7F5E"
                 strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
            </svg>
          </div>
          <p className="deva text-[15.5px] text-bark-900 font-medium">
            अभी कोई निकासी बाकी नहीं है
          </p>
          <p className="deva text-[13px] text-bark-500 mt-2 leading-relaxed">
            पैसे निकालने हों तो बोलिए — पहले हम साथ में देख लेंगे, फिर आप तय कीजिए।
          </p>
        </motion.div>
      )}

      {/* she can talk it through here, same coach */}
      <div>
        <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 mb-3 px-1">
          Talk it through
        </div>
        <VoicePanel voice={voice} />
      </div>
    </div>
  );
}
