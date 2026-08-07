import { motion } from "framer-motion";
import { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import BalanceCard from "./Dashboard/BalanceCard";
import TransactionList from "./Dashboard/TransactionList";
import BottomNav from "./Dashboard/BottomNav";

/* The decoy.
 *
 * Design rule: identical skeleton to the real dashboard — same header, same
 * card stack, same nav, same type, same colours. Someone who has only ever
 * seen this screen must have no reason to suspect another one exists.
 *
 * The differences are all plausible absence rather than visible removal:
 *   · a small believable balance, not ₹0 — an empty account invites
 *     "where did the money go?", which is the opposite of the point
 *   · no dream goal; she simply hasn't set one up
 *   · household spends instead of deposits
 *   · no mic at all. The voice coach is the tell, so it isn't here.
 */
export default function DecoyDashboard({ onLock }) {
  const { state } = useFinance();
  const [tab, setTab] = useState("home");

  return (
    <div className="h-[100svh] overflow-hidden flex flex-col bg-sand-200 paper">
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-9 pb-6 max-w-md w-full mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-7"
        >
          <div>
            <p className="deva text-[13px] text-bark-500">{state.user.greeting}</p>
            <h1 className="deva text-[26px] leading-tight font-semibold text-bark-900">
              {state.user.name}
            </h1>
          </div>
          <button
            onClick={onLock}
            className="w-11 h-11 rounded-full bg-sand-50 shadow-card border border-sand-300/70
                       flex items-center justify-center text-bark-500"
            aria-label="Lock"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round">
              <rect x="4" y="10" width="16" height="11" rx="2.5" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </button>
        </motion.header>

        <div className="space-y-4">
          <BalanceCard amount={state.hiddenSavings} weekDelta={0} decoy />

          {/* Where the goal card sits on the real screen. An empty state, not a
              gap — a hole in the layout would itself be a tell. */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="rounded-5xl border-2 border-dashed border-sand-400 bg-sand-100/60 p-7 text-center"
          >
            <div className="text-[10px] tracking-[.26em] uppercase text-bark-500">Dream Goal</div>
            <p className="deva mt-3 text-[15px] text-bark-500">अभी कोई लक्ष्य नहीं</p>
            <button className="deva mt-4 text-[13px] text-bark-700 bg-sand-50 border border-sand-300
                               rounded-full px-5 py-2 shadow-card">
              लक्ष्य बनाइए
            </button>
          </motion.div>

          <TransactionList transactions={state.transactions} />
        </div>
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
