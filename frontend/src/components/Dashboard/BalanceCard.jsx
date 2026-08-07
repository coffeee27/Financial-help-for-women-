import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useState } from "react";

/* Hidden-savings hero. The number counts up when it changes, so a voice
 * deposit is felt rather than silently re-rendered. */
export default function BalanceCard({ amount, weekDelta, decoy }) {
  const mv = useMotionValue(amount);
  const [shown, setShown] = useState(amount);

  useEffect(() => {
    const controls = animate(mv, amount, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    const unsub = mv.on("change", (v) => setShown(Math.round(v)));
    return () => { controls.stop(); unsub(); };
  }, [amount, mv]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-5xl bg-clay-500 shadow-lift p-7"
    >
      <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-clay-400/40 blur-2xl" />
      <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-clay-700/30 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[10px] tracking-[.26em] uppercase text-sand-300/90">
            Hidden Savings
          </div>
          <div className="mt-3.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl text-sand-200/80">₹</span>
            <span className="font-display text-[46px] leading-none font-semibold text-sand-50 tnum">
              {shown.toLocaleString("en-IN")}
            </span>
          </div>
          {!decoy && weekDelta > 0 && (
            <motion.div
              key={weekDelta}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="deva mt-3 inline-flex items-center gap-1.5 rounded-full
                         bg-sand-50/15 px-3 py-1 text-[12.5px] text-sand-50"
            >
              <span className="text-olive-300">▲</span>
              ₹{weekDelta.toLocaleString("en-IN")} इस हफ्ते
            </motion.div>
          )}
        </div>

        <div className="w-10 h-10 rounded-full border-2 border-sand-200/40
                        flex items-center justify-center shrink-0">
          <motion.div
            animate={decoy ? {} : { rotate: [0, 90, 0] }}
            transition={{ repeat: decoy ? 0 : Infinity, repeatDelay: 4.5, duration: 1.6 }}
            className="w-4 h-4 rounded-full border-2 border-sand-100
                       border-t-transparent border-l-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
}
