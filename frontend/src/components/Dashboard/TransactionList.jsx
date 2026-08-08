
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function TransactionList({ transactions = [] }) {
  const { t } = useTranslation();

  const filteredTransactions = transactions
    .filter((transaction) => transaction.amount !== 0)
    .slice(0, 5);

  const translateValue = (value) => {
    if (!value) return "";

    // Translation-key based data
    if (
      value.startsWith("transactions.") ||
      value.startsWith("dates.")
    ) {
      return t(value);
    }

    // Already-translated / legacy values
    return value;
  };

  const getIconAndStyle = (transaction) => {
    const label = transaction.label || "";

    if (label.startsWith("transactions.newGoal")) {
      return {
        icon: "🎯",
        style: "bg-amber-400/15 text-amber-600",
      };
    }

    if (label.startsWith("transactions.dreamCompleted")) {
      return {
        icon: "🎉",
        style: "bg-amber-400/15 text-amber-600",
      };
    }

    if (label === "transactions.emergencyWithdrawal") {
      return {
        icon: "🆘",
        style: "bg-clay-500/15 text-clay-500",
      };
    }

    if (label === "transactions.match") {
      return {
        icon: "🔄",
        style: "bg-sand-300 text-bark-500",
      };
    }

    if (transaction.type === "save") {
      return {
        icon: "↓",
        style: "bg-olive-500/15 text-olive-600",
      };
    }

    if (transaction.type === "withdraw") {
      return {
        icon: "↑",
        style: "bg-clay-500/15 text-clay-500",
      };
    }

    return {
      icon: transaction.type === "save" ? "↓" : "↑",
      style: "bg-sand-300 text-bark-500",
    };
  };

  const getAmountColor = (transaction) => {
    const label = transaction.label || "";

    if (
      label.startsWith("transactions.newGoal") ||
      label.startsWith("transactions.dreamCompleted")
    ) {
      return "text-amber-600";
    }

    if (
      label === "transactions.emergencyWithdrawal" ||
      transaction.type === "withdraw"
    ) {
      return "text-clay-500";
    }

    if (transaction.type === "save") {
      return "text-olive-600";
    }

    return "text-bark-500";
  };

  return (
    <div className="rounded-5xl bg-sand-50 shadow-card border border-sand-300/60 p-6">

      {/* Card title */}
      <div className="text-[10px] tracking-[.26em] uppercase text-bark-500 mb-4">
        {t("transactions.recent")}
      </div>

      <div className="space-y-3.5">
        <AnimatePresence initial={false}>
          {filteredTransactions.map((transaction) => {
            const { icon, style } = getIconAndStyle(transaction);

            const translatedLabel = translateValue(transaction.label);
            const translatedDate = translateValue(transaction.date);

            const isNewGoal =
              transaction.label?.startsWith("transactions.newGoal");

            return (
              <motion.div
                key={transaction.id}
                layout
                initial={{
                  opacity: 0,
                  x: -14,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-center justify-between"
              >

                {/* Transaction information */}
                <div className="flex items-center gap-3">

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] ${style}`}
                  >
                    {icon}
                  </div>

                  <div>
                    <div className="deva text-[13.5px] text-bark-900 font-medium">
                      {translatedLabel}
                    </div>

                    <div className="deva text-[11.5px] text-bark-500">
                      {translatedDate}
                    </div>
                  </div>

                </div>

                {/* Amount */}
                {!isNewGoal && (
                  <div
                    className={`font-display text-[15px] font-semibold tnum ${getAmountColor(
                      transaction
                    )}`}
                  >
                    {transaction.type === "save" ? "+" : "−"}₹
                    {transaction.amount}
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

