import { motion, AnimatePresence } from "framer-motion";

export default function TransactionList({ transactions = [] }) {
  const filteredTransactions = (transactions || [])
    .filter((t) => t.amount !== 0)
    .slice(0, 5);

  const getIconAndStyle = (t) => {
    const label = t.label || "";
    if (label.startsWith("सपना पूरा:")) {
      return { icon: "🎉", style: "bg-amber-400/15 text-amber-600" };
    }
    if (label.startsWith("नया लक्ष्य:")) {
      return { icon: "🎯", style: "bg-amber-400/15 text-amber-600" };
    }
    if (label === "ज़रूरी निकासी") {
      return { icon: "🆘", style: "bg-clay-500/15 text-clay-500" };
    }
    if (label === "मिलान") {
      return { icon: "🔄", style: "bg-sand-300 text-bark-500" };
    }
    if (t.type === "save") {
      return { icon: "↓", style: "bg-olive-500/15 text-olive-600" };
    }
    if (t.type === "withdraw") {
      return { icon: "↑", style: "bg-clay-500/15 text-clay-500" };
    }
    return {
      icon: t.type === "save" ? "↓" : "↑",
      style: "bg-sand-300 text-bark-500",
    };
  };

  const getAmountColor = (t) => {
    const label = t.label || "";
    if (label.startsWith("सपना पूरा:") || label.startsWith("नया लक्ष्य:")) {
      return "text-amber-600";
    }
    if (label === "ज़रूरी निकासी" || t.type === "withdraw") {
      return "text-clay-500";
    }
    if (t.type === "save") {
      return "text-olive-600";
    }
    return "text-bark-500";
  };

  return (
    <div className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 p-6">
      <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 mb-4">Recent</div>
      <div className="space-y-3.5">
        <AnimatePresence initial={false}>
          {filteredTransactions.map((t) => {
            const { icon, style } = getIconAndStyle(t);
            const isNewGoal = t.label?.startsWith("नया लक्ष्य:");

            return (
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
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] ${style}`}
                  >
                    {icon}
                  </div>
                  <div>
                    <div className="deva text-[13.5px] text-bark-900 font-medium">{t.label}</div>
                    <div className="deva text-[11.5px] text-bark-500">{t.date}</div>
                  </div>
                </div>
                {!isNewGoal && (
                  <div className={`font-display text-[15px] font-semibold tnum ${getAmountColor(t)}`}>
                    {t.type === "save" ? "+" : "−"}₹{t.amount}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
