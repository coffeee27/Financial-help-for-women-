import { motion } from "framer-motion";
import { goalProgress, weeksAtPace } from "../../services/goalService";

/* The dream goal, in full. A ring rather than a bar — it echoes the dial,
 * and a circle reads as "how far round am I" faster than a line does. */
export default function GoalsView({ state }) {
  const goal = state.goal;

  if (!goal) {
    return (
      <div className="pt-10 text-center">
        <p className="deva text-[15px] text-bark-500">अभी कोई लक्ष्य नहीं</p>
      </div>
    );
  }

  const pct = goalProgress(goal);
  const remaining = Math.max(0, goal.target - goal.saved);
  const perWeek = state.safeToSave || 0;
  const weeks = weeksAtPace(state);

  const R = 78;
  const C = 2 * Math.PI * R;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 p-7 text-center"
      >
        <div className="text-[10px] tracking-[.26em] uppercase text-bark-500">Dream Goal</div>
        <h2 className="deva mt-2 text-[24px] leading-tight font-semibold text-bark-900">
          {goal.name}
        </h2>
        <p className="text-[12px] text-bark-500 mt-1">{goal.nameEn}</p>

        <div className="relative mx-auto mt-6 w-[196px] h-[196px]">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
            <circle cx="100" cy="100" r={R} fill="none" stroke="#EDE3D5" strokeWidth="14" />
            <motion.circle
              cx="100" cy="100" r={R} fill="none"
              stroke="#B4532A" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C * (1 - Math.min(pct, 100) / 100) }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[40px] leading-none font-semibold text-bark-900 tnum">
              {Math.min(pct, 100)}
              <span className="text-lg text-bark-500">%</span>
            </span>
            <span className="deva text-[12px] text-bark-500 mt-1">पूरा हुआ</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-sand-100 p-4">
            <div className="text-[9px] tracking-[.18em] uppercase text-bark-500">Saved</div>
            <div className="font-display text-[19px] font-semibold text-bark-900 tnum">
              ₹{goal.saved.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-3xl bg-sand-100 p-4">
            <div className="text-[9px] tracking-[.18em] uppercase text-bark-500">Still needed</div>
            <div className="font-display text-[19px] font-semibold text-clay-500 tnum">
              ₹{remaining.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </motion.div>

      {pct >= 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-5xl bg-gradient-to-r from-amber-400 to-orange-400 p-5 text-center shadow-md"
        >
          <div className="text-3xl mb-2">🎉</div>
          <p className="deva text-[15px] font-semibold text-white leading-snug">
            सपना पूरा! अब बोलिए<br />
            <span className="font-normal opacity-90">"मैंने {goal.name} ले ली"</span>
          </p>
        </motion.div>
      )}

      {weeks !== null && pct < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-5xl bg-olive-500/10 border border-olive-400/30 p-6"
        >
          <div className="deva text-[10px] tracking-[.2em] uppercase text-olive-600 mb-2">
            इस रफ़्तार से
          </div>
          <p className="deva text-[15.5px] leading-relaxed text-bark-900">
            हर हफ्ते ₹{perWeek} बचाने पर, लगभग{" "}
            <span className="font-semibold text-olive-600">{weeks} हफ्ते</span> में
            {" "}{goal.name} आपकी हो जाएगी।
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
        className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 p-6"
      >
        <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 mb-4">
          Contributions
        </div>
        <div className="space-y-3.5">
          {state.transactions.filter((t) => t.type === "save").slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between">
              <div>
                <div className="deva text-[13.5px] text-bark-900 font-medium">{t.label}</div>
                <div className="deva text-[11.5px] text-bark-500">{t.date}</div>
              </div>
              <div className="font-display text-[15px] font-semibold text-olive-600 tnum">
                +₹{t.amount}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
