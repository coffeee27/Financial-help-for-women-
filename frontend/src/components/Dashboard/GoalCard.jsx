import { motion } from "framer-motion";
import { goalProgress, weeksAtPace } from "../../services/goalService";

export default function GoalCard({ goal, state }) {
  if (!goal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-5xl bg-sand-50 shadow-card border-dashed border-2 border-sand-400 p-7 text-center"
      >
        <div className="text-2xl mb-2">✨</div>
        <h3 className="deva text-[20px] font-semibold text-bark-900">
          अपना अगला सपना चुनें
        </h3>
        <p className="deva text-[13px] text-bark-500 mt-1">
          बोलिए &apos;मेरा नया लक्ष्य...&apos;
        </p>
      </motion.div>
    );
  }

  const pct = goalProgress(goal);
  const weeks = weeksAtPace(state);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 p-7"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] tracking-[.26em] uppercase text-bark-500">Dream Goal</div>
          <h3 className="deva mt-2 text-[22px] leading-tight font-semibold text-bark-900">
            {goal.name}
          </h3>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="font-display text-[30px] leading-none font-semibold text-clay-500 tnum"
        >
          {Math.min(pct, 100)}
          <span className="text-base">%</span>
        </motion.div>
      </div>

      <div className="mt-6 relative h-2.5 rounded-full bg-sand-300 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 1.2, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-clay-400 to-clay-500"
        />
        <motion.div
          animate={{ x: ["-120%", "320%"] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", repeatDelay: 2.4 }}
          className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div className="flex gap-8">
          <div>
            <div className="text-[9px] tracking-[.18em] uppercase text-bark-500">Saved</div>
            <div className="font-display text-[17px] font-semibold text-bark-900 tnum">
              ₹{goal.saved.toLocaleString("en-IN")}
            </div>
          </div>
          <div>
            <div className="text-[9px] tracking-[.18em] uppercase text-bark-500">Target</div>
            <div className="font-display text-[17px] font-semibold text-bark-300 tnum">
              ₹{goal.target.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
        {weeks ? (
          <span className="deva text-[12px] text-bark-500">~{weeks} हफ्ते</span>
        ) : null}
      </div>
    </motion.div>
  );
}
