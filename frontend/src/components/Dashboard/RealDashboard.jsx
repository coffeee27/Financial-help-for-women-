import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { useVoice } from "../../hooks/useVoice";
import BalanceCard from "./BalanceCard";
import GoalCard from "./GoalCard";
import InsightCard from "./InsightCard";
import TransactionList from "./TransactionList";
import MicButton from "./MicButton";
import BottomNav from "./BottomNav";
import GoalsView from "./GoalsView";
import VoiceView from "./VoiceView";
import SettingsView from "./SettingsView";
import EmergencyView from "./EmergencyView";
import GrowthCard from "./GrowthCard";
import VoicePanel from "../VoicePanel";
import LanguageToggle from "../LanguageToggle";
import { useTranslation } from "react-i18next";



export default function RealDashboard({ onLock }) {
  const { state, setState } = useFinance();
  const voice = useVoice(state, setState);
  const [tab, setTab] = useState("home");
  const scrollRef = useRef(null);
  const { t, i18n } = useTranslation();

  const changeTab = (next) => {
    setTab(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  /* Asking for money out takes her straight to the review screen, wherever she
   * was. She can also reach it herself from the nav — the point is that the
   * pause happens either way, not that she has to remember to ask for it. */
  useEffect(() => {
    if (voice.pending) {
      setTab("emergency");
      scrollRef.current?.scrollTo({ top: 0 });
    }
  }, [voice.pending]);

  return (
    <div className="h-[var(--app-h)] overflow-hidden flex flex-col bg-sand-200 paper">
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-5 pt-9 pb-6 max-w-md w-full mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-7"
        >
          <div>
            {tab === "home" ? (
              <>
                <p className="deva text-[13px] text-bark-500">
  {t("dashboard.greeting")}
</p>
                <h1 className="deva text-[26px] leading-tight font-semibold text-bark-900">
                  {state.user.name}
                </h1>
              </>
            ) : (
              <>
                <p className="text-[10px] tracking-[.26em] uppercase text-bark-500">
                  {t(`tabs.${tab}`)}
                </p>
                <h1 className="deva text-[26px] leading-tight font-semibold text-bark-900">
                {t(`tabs.${tab}`)}
                </h1>
              </>
            )}
          </div>
          <div className="flex items-center gap-2"></div>
          <LanguageToggle />
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

        {/* Keyed enter animation, deliberately NOT wrapped in AnimatePresence.
            Nesting one inside App's AnimatePresence mode="wait" deadlocked the
            exit: the outer one waited for this dashboard to leave, the inner
            one never released presence, and the lock button silently stopped
            working. No exit needed here — tabs only ever swap. */}
        <div key={tab}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === "home" && (
              <>
                <div className="space-y-4">
                  <BalanceCard amount={state.hiddenSavings} weekDelta={state.weekDelta} />
                  <GoalCard goal={state.goal} state={state} />
                  <InsightCard state={state} />
                  <GrowthCard state={state} />
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
                    {voice.listening
 ? t("home.listening")
 : voice.thinking
 ? t("home.thinking")
 : t("home.speak")}
                  </p>
                </div>

                <div className="mt-5">
                  <VoicePanel voice={voice} />
                </div>
              </>
            )}

            {tab === "goals" && <GoalsView state={state} />}
            {tab === "voice" && <VoiceView voice={voice} />}
            {tab === "emergency" && (
              <EmergencyView state={state} setState={setState} voice={voice} />
            )}
            {tab === "settings" && <SettingsView onLock={onLock} />}
          </motion.div>
        </div>
      </div>

      <BottomNav active={tab} onChange={changeTab} />
    </div>
  );
}
