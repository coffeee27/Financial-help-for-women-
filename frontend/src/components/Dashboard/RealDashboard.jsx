import { motion } from "framer-motion";
import { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { useVoice } from "../../hooks/useVoice";
import BalanceCard from "./BalanceCard";
import GoalCard from "./GoalCard";
import InsightCard from "./InsightCard";
import TransactionList from "./TransactionList";
import MicButton from "./MicButton";
import BottomNav from "./BottomNav";
import VoicePanel from "../VoicePanel";

export default function RealDashboard({ onLock }) {
  const { state, setState } = useFinance();
  const voice = useVoice(state, setState);
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
                       flex items-center justify-center text-bark-500 hover:text-clay-500
                       transition-colors"
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
          <BalanceCard amount={state.hiddenSavings} weekDelta={state.weekDelta} />
          <GoalCard goal={state.goal} />
          <InsightCard state={state} />
          <TransactionList transactions={state.transactions} />
        </div>

        <div className="mt-9 flex flex-col items-center gap-3.5">
          <MicButton
            listening={voice.listening}
            thinking={voice.thinking}
            onTap={voice.start}
            disabled={voice.thinking}
          />
          <p className="deva text-[12.5px] text-bark-500 text-center">
            {voice.listening ? "सुन रही हूँ…" : voice.thinking ? "सोच रही हूँ…" : "बोलने के लिए दबाइए"}
          </p>
        </div>

        <div className="mt-5">
          <VoicePanel voice={voice} />
        </div>
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
