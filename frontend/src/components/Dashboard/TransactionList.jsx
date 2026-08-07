import { motion, AnimatePresence } from "framer-motion";

export default function TransactionList({ transactions }) {
  return (
    <div className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 p-6">
      <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 mb-4">Recent</div>
      <div className="space-y-3.5">
        <AnimatePresence initial={false}>
          {transactions.slice(0, 4).map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: -14, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px]
                  ${t.type === "save" ? "bg-olive-500/15 text-olive-600" : "bg-sand-300 text-bark-500"}`}>
                  {t.type === "save" ? "↓" : "↑"}
                </div>
                <div>
                  <div className="deva text-[13.5px] text-bark-900 font-medium">{t.label}</div>
                  <div className="deva text-[11.5px] text-bark-500">{t.date}</div>
                </div>
              </div>
              <div className={`font-display text-[15px] font-semibold tnum
                ${t.type === "save" ? "text-olive-600" : "text-bark-500"}`}>
                {t.type === "save" ? "+" : "−"}₹{t.amount}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
